# ArmarioVirtual

**Una aplicación móvil inteligente para la gestión sostenible del vestuario personal.**

Aplicación multiplataforma que resuelve la infrautilización de prendas (más del 50% no se usa) mediante digitalización automatizada, recomendación contextual de conjuntos, planificación inteligente de coladas y optimización del espacio.

## Características Principales

- **Digitalización de prendas** — captura de fotos, eliminación automática de fondos y OCR de etiquetas para extraer composición textil
- **Generador de conjuntos** — recomendaciones basadas en clima (GPS) y ocasión, con exportación como imagen
- **Lavandería inteligente** — agrupa coladas por color y tejido, calcula temperatura mínima segura
- **Optimización espacial** — sugerencias de almacenamiento (colgar, doblar, enrollar) según composición textil

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React Native + Expo (TypeScript) |
| **Backend** | Supabase (PostgreSQL, Auth JWT, Storage con RLS) |
| **IA** | Python FastAPI — rembg (fondos) + EasyOCR (OCR multiidioma) |
| **Metodología** | Scrum + OpenUP, Git, GitHub Projects |

## Instalación Rápida

### Frontend

```bash
git clone https://github.com/[victorialpz]/ArmarioVirtual.git
cd ArmarioVirtual
npm install
expo start
```

### Microservicio

```bash
cd servidor_local
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Configuración

Crea un archivo `.env` con:

```
REACT_APP_SUPABASE_URL=<tu-url>
REACT_APP_SUPABASE_ANON_KEY=<tu-clave>
REACT_APP_OPENWEATHER_API_KEY=<tu-clave>
REACT_APP_MICROSERVICE_URL=http://localhost:8000
```

## Estructura del Proyecto

```
ArmarioVirtual/
├── app/                     # Pantallas (React Native)
│   ├── armario.tsx          # Catálogo de prendas
│   ├── outfit.tsx           # Generador de conjuntos
│   ├── lavado.tsx           # Módulo de coladas
│   └── ...
├── hooks/                   # Lógica de negocio
├── lib/                     # Utilidades y motores de reglas
├── servidor_local/          # Microservicio FastAPI
└── database/                # Scripts SQL
```

## Base de Datos

6 tablas principales: `usuarios`, `prendas`, `outfits`, `outfit_prendas`, `armario_config`, `catalogo_lavadoras` — todas con **políticas RLS** para seguridad de datos.

## Limitaciones Conocidas

- **OCR de símbolos**: lee texto de etiquetas, no pictogramas. Solución: selección asistida visual
- **Microservicio local**: solo para desarrollo. Para producción se necesita infraestructura en la nube escalable

## Líneas de Trabajo Futuro

- Reconocimiento automático de símbolos de cuidado
- Motor de recomendación con aprendizaje personalizado
- Despliegue en cloud (AWS/GCP)

## Autor

**Victoria López González** — Ingeniera Informática, UCLM (Toledo)  
---

**Última actualización**: Julio 2026
