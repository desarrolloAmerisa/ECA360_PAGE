from __future__ import annotations

from copy import deepcopy
from typing import Any

TEMPLATES: dict[str, dict[str, Any]] = {
    "boda": {
        "label": "Boda",
        "excerpt": "Celebramos el amor en un día inolvidable.",
        "blocks": [
            {
                "type": "hero",
                "position": 0,
                "content": {
                    "title": "Nuestra Boda",
                    "subtitle": "Un día lleno de amor",
                    "image": "",
                    "overlay": True,
                },
                "settings": {"align": "center", "height": "large"},
            },
            {
                "type": "title",
                "position": 1,
                "content": {"text": "La celebración"},
                "settings": {"align": "center", "size": "xl"},
            },
            {
                "type": "paragraph",
                "position": 2,
                "content": {
                    "text": "Compartimos con ustedes los mejores momentos de esta celebración especial."
                },
                "settings": {"align": "center"},
            },
            {
                "type": "gallery",
                "position": 3,
                "content": {"images": [], "columns": 3},
                "settings": {},
            },
            {
                "type": "quote",
                "position": 4,
                "content": {
                    "text": "El amor no se mira, se siente, y aún más cuando se vive juntos.",
                    "author": "",
                },
                "settings": {"align": "center"},
            },
            {
                "type": "carousel",
                "position": 5,
                "content": {"items": []},
                "settings": {},
            },
        ],
    },
    "xv_anos": {
        "label": "XV Años",
        "excerpt": "Una noche mágica para recordar siempre.",
        "blocks": [
            {
                "type": "hero",
                "position": 0,
                "content": {
                    "title": "Mis XV Años",
                    "subtitle": "Una noche de ensueño",
                    "image": "",
                    "overlay": True,
                },
                "settings": {"align": "center", "height": "large"},
            },
            {
                "type": "subtitle",
                "position": 1,
                "content": {"text": "El vals, los momentos y las sonrisas"},
                "settings": {"align": "center"},
            },
            {
                "type": "paragraph",
                "position": 2,
                "content": {
                    "text": "Gracias a todos los que formaron parte de esta celebración tan especial."
                },
                "settings": {"align": "center"},
            },
            {
                "type": "gallery",
                "position": 3,
                "content": {"images": [], "columns": 3},
                "settings": {},
            },
            {
                "type": "video_youtube",
                "position": 4,
                "content": {"url": "", "caption": "Video de la celebración"},
                "settings": {},
            },
            {
                "type": "carousel",
                "position": 5,
                "content": {"items": []},
                "settings": {},
            },
        ],
    },
    "graduacion": {
        "label": "Graduación",
        "excerpt": "El inicio de un nuevo capítulo.",
        "blocks": [
            {
                "type": "hero",
                "position": 0,
                "content": {
                    "title": "Graduación",
                    "subtitle": "Logros que celebramos juntos",
                    "image": "",
                    "overlay": True,
                },
                "settings": {"align": "center", "height": "large"},
            },
            {
                "type": "title",
                "position": 1,
                "content": {"text": "Un logro compartido"},
                "settings": {"align": "left", "size": "lg"},
            },
            {
                "type": "two_columns",
                "position": 2,
                "content": {
                    "left": "El esfuerzo de años se refleja en esta gran noche.",
                    "right": "Familia, amigos y maestros: gracias por acompañarnos.",
                },
                "settings": {},
            },
            {
                "type": "gallery",
                "position": 3,
                "content": {"images": [], "columns": 4},
                "settings": {},
            },
            {
                "type": "carousel",
                "position": 4,
                "content": {"items": []},
                "settings": {},
            },
        ],
    },
    "corporativo": {
        "label": "Corporativo",
        "excerpt": "Evento profesional con estilo y presencia.",
        "blocks": [
            {
                "type": "hero",
                "position": 0,
                "content": {
                    "title": "Evento Corporativo",
                    "subtitle": "Conectando ideas y personas",
                    "image": "",
                    "overlay": True,
                },
                "settings": {"align": "left", "height": "medium"},
            },
            {
                "type": "title",
                "position": 1,
                "content": {"text": "Resumen del evento"},
                "settings": {"align": "left", "size": "lg"},
            },
            {
                "type": "paragraph",
                "position": 2,
                "content": {
                    "text": "Una jornada de networking, presentaciones y momentos clave para la organización."
                },
                "settings": {"align": "left"},
            },
            {
                "type": "list",
                "position": 3,
                "content": {
                    "items": ["Bienvenida", "Conferencias", "Networking", "Cierre"],
                    "ordered": False,
                },
                "settings": {},
            },
            {
                "type": "gallery",
                "position": 4,
                "content": {"images": [], "columns": 3},
                "settings": {},
            },
            {
                "type": "button",
                "position": 5,
                "content": {"label": "Contactar", "url": "#", "style": "primary"},
                "settings": {"align": "center"},
            },
        ],
    },
    "evento_libre": {
        "label": "Evento Libre",
        "excerpt": "Cuenta la historia de tu evento a tu manera.",
        "blocks": [
            {
                "type": "hero",
                "position": 0,
                "content": {
                    "title": "Nuevo Evento",
                    "subtitle": "Personaliza cada detalle",
                    "image": "",
                    "overlay": True,
                },
                "settings": {"align": "center", "height": "large"},
            },
            {
                "type": "paragraph",
                "position": 1,
                "content": {"text": "Comienza a construir tu historia con bloques."},
                "settings": {"align": "left"},
            },
            {
                "type": "spacer",
                "position": 2,
                "content": {"height": 40},
                "settings": {},
            },
            {
                "type": "gallery",
                "position": 3,
                "content": {"images": [], "columns": 3},
                "settings": {},
            },
        ],
    },
}


def get_template_blocks(template_key: str) -> list[dict[str, Any]]:
    tpl = TEMPLATES.get(template_key)
    if not tpl:
        return deepcopy(TEMPLATES["evento_libre"]["blocks"])
    return deepcopy(tpl["blocks"])


def list_templates() -> list[dict[str, str]]:
    return [{"key": k, "label": v["label"], "excerpt": v["excerpt"]} for k, v in TEMPLATES.items()]
