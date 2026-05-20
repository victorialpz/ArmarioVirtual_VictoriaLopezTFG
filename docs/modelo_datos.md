# Modelo de Datos - Armario Virtual

Este documento define la arquitectura de la base de datos (Supabase / PostgreSQL) para la gestión virtual del armario.

## Diagrama Entidad-Relación

```mermaid
erDiagram
    USUARIOS ||--o{ PRENDAS : "tiene"
    USUARIOS ||--o{ OUTFITS : "crea"
    OUTFITS ||--|{ OUTFIT_PRENDAS : "contiene"
    PRENDAS ||--o{ OUTFIT_PRENDAS : "es parte de"

    USUARIOS {
        uuid id PK
        string email
        string password_hash
        string nombre
        string apellidos
        string telefono
        string sexo
        int edad
        float altura
    }

    PRENDAS {
        uuid id PK
        uuid id_usuario FK
        string nombre
        string categoria
        string color
        string tejido
        int temp_lavado
        boolean es_delicado
        string tipo_almacenamiento
        string imagen_url
        string etiqueta_ocr
        boolean es_favorito
    }

    OUTFITS {
        uuid id PK
        uuid id_usuario FK
        string nombre
        string clima_ideal
        string evento_ideal
        date fecha_creacion
    }

    OUTFIT_PRENDAS {
        uuid id_outfit FK
        uuid id_prenda FK
    }