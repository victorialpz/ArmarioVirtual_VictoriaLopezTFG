from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor
from difflib import get_close_matches
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove, new_session
import easyocr

_ocr_executor = ThreadPoolExecutor(max_workers=1)

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
    # Naturales menos comunes
    'cañamo': 'Cáñamo', 'cáñamo': 'Cáñamo', 'hemp': 'Cáñamo', 'chanvre': 'Cáñamo',
    'yute': 'Yute', 'jute': 'Yute',
    'angora': 'Angora',
    'alpaca': 'Alpaca',
    'mohair': 'Mohair',
    # Sintéticas / técnicas
    'poliuretano': 'Poliuretano', 'polyurethane': 'Poliuretano', 'pu': 'Poliuretano',
    'polipropileno': 'Polipropileno', 'polypropylene': 'Polipropileno',
    'microfibra': 'Microfibra', 'microfiber': 'Microfibra', 'microfibre': 'Microfibra',
    'neopreno': 'Neopreno', 'neoprene': 'Neopreno',
    'gore-tex': 'Gore-Tex', 'goretex': 'Gore-Tex',
    # Artificiales / especiales
    'acetato': 'Acetato', 'acetate': 'Acetato',
    'cupro': 'Cupro', 'cupra': 'Cupro',
    'bambu': 'Bambú', 'bambú': 'Bambú', 'bamboo': 'Bambú',
    # Tejidos / estructuras
    'terciopelo': 'Terciopelo', 'velvet': 'Terciopelo', 'velours': 'Terciopelo',
    'saten': 'Satén', 'satén': 'Satén', 'satin': 'Satén',
    'franela': 'Franela', 'flannel': 'Franela',
    'tul': 'Tul', 'tulle': 'Tul',
    'encaje': 'Encaje', 'lace': 'Encaje', 'dentelle': 'Encaje',
    'fieltro': 'Fieltro', 'felt': 'Fieltro', 'feutre': 'Fieltro',
    'tweed': 'Tweed',
    'popelin': 'Popelín', 'popelín': 'Popelín', 'poplin': 'Popelín',
    'sarga': 'Sarga', 'twill': 'Sarga',
}

TIPOS_TELA_APP = {'Algodón', 'Lana', 'Poliéster', 'Lino', 'Seda', 'Vaquero/Denim', 'Cuero', 'Gasa'}

PAT_NUM_MAT = re.compile(r'\b([1-9][0-9]{0,2})\s*%\s*([A-Za-zÀ-ÿ]{3,})', re.IGNORECASE)
PAT_MAT_NUM = re.compile(r'\b([A-Za-zÀ-ÿ]{3,})\s+([1-9][0-9]{0,2})\s*%', re.IGNORECASE)

# El OCR confunde % con: 3, 4, t, *, '/, ° — esta regex los normaliza antes de aplicar los patrones
_RE_PCT_FIX = re.compile(
    r'\b([1-9][0-9]{0,2})\s*[3-4t\*\'\/°]{1,2}\s*(?=[A-Za-zÀ-ÿ]{3,})',
    re.IGNORECASE,
)

# Caracteres válidos en una etiqueta de composición textil
_OCR_ALLOWLIST = (
    '0123456789% '
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    'áéíóúñüÁÉÍÓÚÑÜàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛãõÃÕäöÄÖßčšžČŠŽłŁ'
    '-.'
)


def _reconstruir_texto(bloques_raw: list, tolerancia_y: int = 20) -> str:
    """Reconstruye el texto respetando el orden visual línea a línea usando las coordenadas del OCR."""
    if not bloques_raw:
        return ''
    lineas: dict[int, list[tuple[float, str]]] = {}
    for bbox, texto, _ in bloques_raw:
        y_centro = int((bbox[0][1] + bbox[2][1]) / 2)
        bucket = next((k for k in lineas if abs(k - y_centro) < tolerancia_y), y_centro)
        lineas.setdefault(bucket, []).append((bbox[0][0], texto))
    resultado = []
    for y_key in sorted(lineas):
        fila = sorted(lineas[y_key], key=lambda t: t[0])
        resultado.append(' '.join(t for _, t in fila))
    return '\n'.join(resultado)


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
    """Escala, realza contraste y aplica sharpen para mejorar el OCR."""
    if imagen_pil.width < 1500:
        factor = 1500 / imagen_pil.width
        imagen_pil = imagen_pil.resize((1500, int(imagen_pil.height * factor)), Image.LANCZOS)
    img = imagen_pil.convert('L')
    img = ImageEnhance.Contrast(img).enhance(1.5)
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


def extraer_temperatura(texto: str) -> int | None:
    candidatos = re.findall(r'(\d{2})\s*°?\s*c?\b', texto, re.IGNORECASE)
    validas = [int(c) for c in candidatos if int(c) in (30, 40, 60, 90, 95)]
    return min(validas) if validas else None


def detectar_delicado(texto: str) -> bool:
    claves = ['delicado', 'delicate', 'mano', 'hand wash', 'no centrifugar',
              'gentle', 'dry clean', 'limpieza en seco']
    return any(c in texto for c in claves)


def extraer_composicion(texto: str) -> dict:
    """
    Recoge votos de porcentaje por material de todas las coincidencias
    (la etiqueta repite la misma composición en 10-15 idiomas).
    El porcentaje más frecuente para cada material es el correcto.
    """
    texto = _normalizar_texto(texto)
    votos: dict[str, list[int]] = {}
    print(texto)
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
    imagen_rgb = Image.open(io.BytesIO(imagen_bytes)).convert('RGB')
    import os
    _debug_path = os.path.join(os.path.dirname(__file__), "debug_etiqueta.jpg")
    imagen_rgb.save(_debug_path)
    print(f"[DEBUG] Imagen guardada en {_debug_path} — tamaño: {imagen_rgb.size} px")

    loop = asyncio.get_event_loop()

    # 1er intento: imagen RGB original con coordenadas para reconstruir orden visual
    bloques_raw = await loop.run_in_executor(
        _ocr_executor,
        lambda: ocr_reader.readtext(np.array(imagen_rgb), detail=1, paragraph=False, allowlist=_OCR_ALLOWLIST)
    )
    print(f"[OCR-1-RGB] {len(bloques_raw)} bloques")

    # 2do intento: escalar + realzar contraste si el 1er resultado es pobre
    if len(bloques_raw) < 5:
        imagen_procesada = preprocess_label(imagen_rgb)
        bloques_raw2 = await loop.run_in_executor(
            _ocr_executor,
            lambda: ocr_reader.readtext(np.array(imagen_procesada), detail=1, paragraph=False, allowlist=_OCR_ALLOWLIST)
        )
        print(f"[OCR-2-PREP] {len(bloques_raw2)} bloques")
        if len(bloques_raw2) > len(bloques_raw):
            bloques_raw = bloques_raw2

    texto_raw = _reconstruir_texto(bloques_raw).lower()
    print(f"[OCR] texto reconstruido: {texto_raw[:300]!r}")

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
        "temp_lavado": extraer_temperatura(texto_raw),
        "es_delicado": detectar_delicado(texto_raw),
    }


@app.post("/quitar-fondo")
async def quitar_fondo(file: UploadFile = File(...)):
    imagen_bytes = await file.read()
    resultado_png_bytes = remove(imagen_bytes, session=session)
    return Response(content=resultado_png_bytes, media_type="image/png")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
