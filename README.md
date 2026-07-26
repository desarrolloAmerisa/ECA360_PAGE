# ECA360 — CMS de Eventos

Sitio tipo blog para publicar eventos con panel administrativo, constructor visual de bloques, galerías multimedia y comentarios.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite, TailwindCSS v4, Framer Motion, React Router, Axios, React Hook Form, dnd-kit, Swiper, Lightbox |
| Backend | FastAPI, SQLAlchemy, Pydantic, Alembic, Uvicorn |
| DB | SQLite (dev) / PostgreSQL (producción) |

## Características

- Blog público de eventos con buscador, filtro por año e infinite scroll
- Panel `/admin` con contraseña única (`ADMIN_PASSWORD`) — sin JWT/OAuth/roles
- CRUD de eventos: crear, editar, eliminar, duplicar, publicar, ocultar
- Constructor visual tipo Notion (16 tipos de bloque, drag & drop, vista previa)
- Plantillas: Boda, XV Años, Graduación, Corporativo, Evento Libre
- Upload de imágenes (compresión + miniaturas) y videos (MP4, MOV, WebM)
- Carrusel multimedia con miniaturas, fullscreen y pausa automática al cambiar slide
- Comentarios sin registro + moderación en admin
- SEO automático, slugs, Open Graph, skeleton loading, lazy loading, toasts, 404

## Estructura

```
backend/          FastAPI + SQLAlchemy + Alembic
frontend/         React (Vite) + Tailwind
deploy/           Docker + install.sh (VPS por IP:8080)
```

## Despliegue en VPS (Docker + SQLite, sin dominio)

Pensado para un VPS donde **otro proyecto ya usa 80/443** (ej. LRJAS). ECA360 escucha en el puerto **8080** y no toca ese stack.

```bash
# Sube el repo a /opt/eca360 (git clone / rsync / scp)
cd /opt/eca360
bash deploy/install.sh --port 8080 --password 'TuPasswordSegura'
```

Luego abre:

- `http://IP_PUBLICA:8080`
- `http://IP_PUBLICA:8080/admin`

Abre el puerto **8080/tcp** en el firewall del cloud (y UFW si aplica).

Comandos útiles:

```bash
cd /opt/eca360/deploy
docker compose logs -f
docker compose down          # parar
docker compose up -d --build # reiniciar / actualizar
```

Datos (SQLite + uploads) viven en el volume Docker `eca360_data`.

## Requisitos (desarrollo local)

- Python 3.11+
- Node.js 20+
- (Opcional) PostgreSQL / Docker en el VPS

## Instalación rápida

### 1. Backend

```bash
cd backend
py -3 -m venv .venv

# Windows
.\.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # o: cp .env.example .env
```

Edita `.env` y define tu contraseña:

```env
ADMIN_PASSWORD=tu_contraseña_segura
DATABASE_URL=sqlite:///./eca360.db
```

Para PostgreSQL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/eca360
```

Arranca la API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Migraciones Alembic (opcional; las tablas también se crean al iniciar):

```bash
alembic upgrade head
```

API docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

Sitio: http://localhost:5173  
Admin: http://localhost:5173/admin  

Contraseña por defecto de ejemplo: `eca360admin`

## API principal

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events` | Listar eventos publicados |
| GET | `/events/slug/{slug}` | Detalle por slug |
| POST | `/events` | Crear (admin) |
| PUT | `/events/{id}` | Actualizar (admin) |
| DELETE | `/events/{id}` | Eliminar (admin) |
| POST | `/events/{id}/duplicate` | Duplicar (admin) |
| POST | `/events/{id}/publish` | Publicar (admin) |
| POST | `/events/{id}/hide` | Ocultar (admin) |
| POST | `/comments` | Crear comentario |
| GET | `/comments/event/{id}` | Comentarios de un evento |
| DELETE | `/comments/{id}` | Eliminar (admin) |
| POST | `/admin/login` | Login con contraseña |
| POST | `/upload` | Subir imagen/video (admin) |

## Autenticación admin

1. `POST /admin/login` con `{ "password": "..." }`
2. Guardar el `token` en `localStorage` (`eca360_admin_token`)
3. Enviar header `Authorization: Bearer <token>` en rutas protegidas

## Bloques del constructor

Hero, Título, Subtítulo, Párrafo, Imagen, Galería, Video local, Video YouTube, Carrusel multimedia, Dos columnas, Botón, Cita, Tabla, Lista, Separador, Espaciador.

Cada bloque soporta: arrastrar, duplicar, eliminar, vista previa y panel lateral de configuración.

## Multimedia

- Imágenes → `/uploads/images` (+ thumbnails en `/uploads/thumbnails`)
- Videos → `/uploads/videos`
- Límites configurables: `MAX_IMAGE_SIZE_MB`, `MAX_VIDEO_SIZE_MB`

## Producción

1. Usa PostgreSQL y un `ADMIN_PASSWORD` fuerte
2. `npm run build` en frontend y sirve `frontend/dist`
3. Ejecuta uvicorn detrás de un reverse proxy (Nginx/Caddy)
4. Monta el volumen `uploads/` de forma persistente
5. Configura `CORS_ORIGINS` y `APP_URL` / `API_URL`

## Colores

- Rojo marca: `#C1121F`
- Blanco, gris claro (`#F5F5F5`), negro (`#0A0A0A`)

## Licencia

Proyecto privado ECA360.
