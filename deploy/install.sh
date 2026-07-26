#!/usr/bin/env bash
# ECA360 — instalación en VPS (Docker + SQLite + puerto 8080)
# No toca otros proyectos (ej. LRJAS en :80/:443).
#
# Uso:
#   cd /opt/eca360
#   bash deploy/install.sh
#   bash deploy/install.sh --port 8080 --password 'TuPassword'
#
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$APP_DIR/deploy"
PORT="${HTTP_PORT:-8080}"
PASSWORD="${ADMIN_PASSWORD:-eca360admin}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      PORT="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    -h|--help)
      echo "Uso: bash deploy/install.sh [--port 8080] [--password 'secreto']"
      exit 0
      ;;
    *)
      echo "Opción desconocida: $1"
      exit 1
      ;;
  esac
done

echo "==> Directorio: $APP_DIR"
echo "==> Puerto público: $PORT"

if [[ ! -d "$APP_DIR/backend" || ! -d "$APP_DIR/frontend" ]]; then
  echo "ERROR: No encuentro backend/ o frontend/ en $APP_DIR"
  echo "Sube el proyecto completo a esta ruta (ej. /opt/eca360)."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker no está instalado."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Necesitas el plugin 'docker compose'."
  exit 1
fi

PUBLIC_IP="$(curl -4 -fsS --max-time 5 ifconfig.me 2>/dev/null \
  || curl -4 -fsS --max-time 5 icanhazip.com 2>/dev/null \
  || true)"
PUBLIC_IP="$(echo "${PUBLIC_IP:-}" | tr -d '[:space:]')"

if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="TU_IP_PUBLICA"
  echo "!! No pude detectar la IP pública automáticamente."
fi

PUBLIC_URL="http://${PUBLIC_IP}:${PORT}"

# Abrir puerto en UFW si aplica (no falla si ufw no está activo)
if command -v ufw >/dev/null 2>&1; then
  if ufw status 2>/dev/null | grep -qi "Status: active"; then
    echo "==> Abriendo puerto ${PORT}/tcp en UFW..."
    ufw allow "${PORT}/tcp" || true
  fi
fi

cd "$DEPLOY_DIR"

# Same-origin: VITE_API_URL vacío; el navegador llama a http://IP:PORT/...
cat > .env <<EOF
HTTP_PORT=${PORT}
ADMIN_PASSWORD=${PASSWORD}
VITE_API_URL=
APP_URL=${PUBLIC_URL}
API_URL=${PUBLIC_URL}
CORS_ORIGINS=*
EOF

echo "==> Construyendo e iniciando contenedores (SQLite)..."
docker compose --env-file .env up -d --build

echo
echo "============================================"
echo " ECA360 listo"
echo " URL:       ${PUBLIC_URL}"
echo " Admin:     ${PUBLIC_URL}/admin"
echo " Password:  (la de --password / ADMIN_PASSWORD)"
echo " Puerto:    ${PORT}  (LRJAS u otros en 80/443 no se tocan)"
echo "============================================"
echo
echo "Logs:    cd ${DEPLOY_DIR} && docker compose logs -f"
echo "Parar:   cd ${DEPLOY_DIR} && docker compose down"
echo "Datos:   volume Docker eca360_data (SQLite + uploads)"
echo
echo "Si no carga desde fuera, abre el puerto ${PORT} en el firewall del cloud."
