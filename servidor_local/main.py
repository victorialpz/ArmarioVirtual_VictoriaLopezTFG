from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import re
from difflib import get_close_matches
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove, new_session
import easyocr

app = FastAPI(title="API Armario Virtual - TFG")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("⏳ Cargando modelo de eliminación de fondo (primera vez descarga ~170MB)...")
session = new_session("isnet-general-use")
print("✅ Modelo listo. Servidor en http://0.0.0.0:8000")

ocr_reader = None

MATERIALES_MAP = {
    # Algodón — todas las variantes EU
    'cotton': 'Algodón', 'coton': 'Algodón', 'cotone': 'Algodón',
    'algodón': 'Algodón', 'algodao': 'Algodón', 'algadão': 'Algodón',
    'katoen': 'Algodón', 'bomull': 'Algodón', 'bavina': 'Algodón',
    'pamuk': 'Algodón', 'bumbac': 'Algodón', 'bombac': 'Algodón',
    'bavlna': 'Algodón', 'bawelna': 'Algodón',  # CZ/SK/PL
    'baumwolle': 'Algodón',                      # DE
    'pamut': 'Algodón',                          # HU
    'bomuld': 'Algodón',                         # DA
    'puuvilla': 'Algodón',                       # FI
    'bombaz': 'Algodón',                         # SL (bombaž)
    # Elastán
    'elastane': 'Elastán', 'elastán': 'Elastán', 'elastano': 'Elastán',
    'elastanne': 'Elastán', 'elasthan': 'Elastán', 'spandex': 'Elastán',
    'lycra': 'Elastán', 'elastan': 'Elastán',
    'elasthanne': 'Elastán', 'elasztan': 'Elastán',  # FR/HU
    # Poliéster
    'polyester': 'Poliéster', 'poliéster': 'Poliéster', 'polyamide': 'Poliéster',
    # Lana
    'wool': 'Lana', 'laine': 'Lana', 'wolle': 'Lana', 'lana': 'Lana',
    # Lino
    'linen': 'Lino', 'lin': 'Lino', 'lino': 'Lino', 'leinen': 'Lino',
    # Seda
    'silk': 'Seda', 'seda': 'Seda', 'soie': 'Seda', 'seide': 'Seda',
    # Viscosa
    'viscose': 'Viscosa', 'viscosa': 'Viscosa', 'rayon': 'Viscosa',
    # Nylon
    'nylon': 'Nylon', 'nailon': 'Nylon',
}

TIPOS_TELA_APP = {'Algodón', 'Lana', 'Poliéster', 'Lino', 'Seda', 'Vaquero/Denim', 'Cuero', 'Gasa'}

PAT_NUM_MAT = re.compile(r'\b([1-9][0-9]?)\s*%\s*([A-Za-zÀ-ÿ]{3,})', re.IGNORECASE)
PAT_MAT_NUM = re.compile(r'\b([A-Za-zÀ-ÿ]{3,})\s+([1-9][0-9]?)\s*%', re.IGNORECASE)

# El OCR confunde % con: 3, 4, t, *, '/, ° — esta regex los normaliza antes de aplicar los patrones
_RE_PCT_FIX = re.compile(
    r'\b([1-9][0-9]?)\s*[3-4t\*\'\/°]{1,2}\s*(?=[A-Za-zÀ-ÿ]{3,})',
    re.IGNORECASE,
)


def _normalizar_texto(texto: str) -> str:
    """Sustituye lecturas erróneas del símbolo % por el literal '%'."""
    return _RE_PCT_FIX.sub(lambda m: f"{m.group(1)}% ", texto)


def _otsu(img_np: np.ndarray) -> int:
    """Umbral óptimo de binarización (método de Otsu sin OpenCV)."""
    hist, _ = np.histogram(img_np.flatten(), bins=256, range=[0, 256])
    total = img_np.size
    s_total = int(np.dot(np.arange(256), hist))
    best, threshold, s_back, w_back = 0, 128, 0, 0
    for i in range(256):
        w_back += hist[i]
        if w_back == 0:
            continue
        w_fore = total - w_back
        if w_fore == 0:
            break
        s_back += i * int(hist[i])
        mb = s_back / w_back
        mf = (s_total - s_back) / w_fore
        var = w_back * w_fore * (mb - mf) ** 2
        if var > best:
            best, threshold = var, i
    return threshold


def preprocess_label(imagen_pil: Image.Image) -> Image.Image:
    """Escala, binariza con Otsu y aplica sharpen para mejorar el OCR."""
    if imagen_pil.width < 1500:
        factor = 1500 / imagen_pil.width
        imagen_pil = imagen_pil.resize((1500, int(imagen_pil.height * factor)), Image.LANCZOS)
    img_np = np.array(imagen_pil.convert('L'))
    t = _otsu(img_np)
    binaria = np.where(img_np > t, 255, 0).astype(np.uint8)
    img = Image.fromarray(binaria)
    img = img.filter(ImageFilter.SHARPEN)
    return img


def _resolver(word: str) -> str | None:
    """
    Devuelve el nombre estándar del material o None si no lo reconoce.
    FIX 3: usa difflib para manejar errores OCR como 'EJastane' → 'Elastán'.
    """
    w = word.lower().strip()
    if w in MATERIALES_MAP:
        return MATERIALES_MAP[w]
    hits = get_close_matches(w, MATERIALES_MAP.keys(), n=1, cutoff=0.70)
    return MATERIALES_MAP[hits[0]] if hits else None


def extraer_composicion(texto: str) -> dict:
    """
    Recoge votos de porcentaje por material de todas las coincidencias
    (la etiqueta repite la misma composición en 10-15 idiomas).
    El porcentaje más frecuente para cada material es el correcto.
    """
    texto = _normalizar_texto(texto)
    votos: dict[str, list[int]] = {}

    for m in PAT_NUM_MAT.finditer(texto):
        pct, word = int(m.group(1)), m.group(2)
        material = _resolver(word)
        if material:
            votos.setdefault(material, []).append(pct)

    for m in PAT_MAT_NUM.finditer(texto):
        word, pct = m.group(1), int(m.group(2))
        material = _resolver(word)
        if material:
            votos.setdefault(material, []).append(pct)

    composicion = {mat: max(set(pcts), key=pcts.count) for mat, pcts in votos.items()}

    if sum(composicion.values()) > 130:
        composicion = {k: v for k, v in composicion.items() if v >= 5}

    return composicion


@app.get("/")
def home():
    return {"mensaje": "API Armario Virtual lista"}


@app.post("/leer-etiqueta")
async def leer_etiqueta(file: UploadFile = File(...)):
    global ocr_reader
    if ocr_reader is None:
        print("⏳ Cargando modelo OCR (~400MB primera vez)...")
        ocr_reader = easyocr.Reader(['es', 'en'], gpu=False)
        print("✅ Modelo OCR listo.")

    imagen_bytes = await file.read()
    imagen = Image.open(io.BytesIO(imagen_bytes))
    imagen_procesada = preprocess_label(imagen)

    # detail=1 → confianza por bloque; paragraph=False → bloques individuales más precisos
    bloques_raw = ocr_reader.readtext(np.array(imagen_procesada), detail=1, paragraph=False)
    bloques = [texto for (_, texto, conf) in bloques_raw if conf > 0.3]
    texto_raw = ' '.join(bloques)

    composicion = extraer_composicion(texto_raw)

    if composicion:
        partes = sorted(composicion.items(), key=lambda x: -x[1])
        texto_limpio = ', '.join(f"{pct}% {mat}" for mat, pct in partes)
    else:
        texto_limpio = ''

    tipo_tela_sugerido = None
    if composicion:
        principal = max(composicion, key=composicion.get)
        if principal in TIPOS_TELA_APP:
            tipo_tela_sugerido = principal

    return {
        "ocr_text": texto_limpio,
        "composicion": composicion,
        "tipo_tela_sugerido": tipo_tela_sugerido,
    }


@app.post("/quitar-fondo")
async def quitar_fondo(file: UploadFile = File(...)):
    imagen_bytes = await file.read()

    resultado_rgba_bytes = remove(imagen_bytes, session=session)

    imagen_rgba = Image.open(io.BytesIO(resultado_rgba_bytes)).convert("RGBA")
    fondo_blanco = Image.new("RGBA", imagen_rgba.size, "WHITE")
    fondo_blanco.paste(imagen_rgba, (0, 0), imagen_rgba)
    resultado_final = fondo_blanco.convert("RGB")

    buffer_salida = io.BytesIO()
    resultado_final.save(buffer_salida, format="JPEG", quality=95)
    buffer_salida.seek(0)

    return Response(content=buffer_salida.getvalue(), media_type="image/jpeg")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
