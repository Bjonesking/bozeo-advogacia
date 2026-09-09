import os
from PIL import Image

DIR = os.path.join(os.path.dirname(__file__), "equipe-raw")
OUT = os.path.dirname(__file__)

TARGET_W, TARGET_H = 900, 1200  # aspect 3:4, mesmo dos cards do carrossel

files = ["romulo.png", "amanda.png", "ingrid.png", "juliana.png"]

for name in files:
    path = os.path.join(DIR, name)
    img = Image.open(path).convert("RGBA")
    alpha = img.split()[-1]
    bbox = alpha.getbbox()  # (left, top, right, bottom) do conteúdo não-transparente
    if not bbox:
        bbox = (0, 0, img.width, img.height)
    left, top, right, bottom = bbox
    content_w = right - left
    content_h = bottom - top
    cx = (left + right) / 2

    # Queremos enquadrar rosto+ombros/torso numa proporção 3:4, ancorado no topo
    # (cabeça perto do topo) com uma margem pequena acima da cabeça.
    target_ratio = TARGET_W / TARGET_H  # 0.75

    # Começa a partir da largura do conteúdo, com um pouco de respiro nas laterais
    crop_w = content_w * 1.12
    crop_h = crop_w / target_ratio

    # Margem acima da cabeça (top do bbox) proporcional à largura
    margin_top = crop_w * 0.10
    crop_top = max(0, top - margin_top)
    crop_bottom = crop_top + crop_h

    # Se ultrapassar a altura da imagem original, reancora pelo fundo
    if crop_bottom > img.height:
        crop_bottom = img.height
        crop_top = max(0, crop_bottom - crop_h)

    crop_left = cx - crop_w / 2
    crop_right = cx + crop_w / 2
    if crop_left < 0:
        crop_right -= crop_left
        crop_left = 0
    if crop_right > img.width:
        crop_left -= (crop_right - img.width)
        crop_right = img.width
        crop_left = max(0, crop_left)

    box = (int(crop_left), int(crop_top), int(crop_right), int(crop_bottom))
    cropped = img.crop(box)
    resized = cropped.resize((TARGET_W, TARGET_H), Image.LANCZOS)

    out_path = os.path.join(OUT, name)
    resized.save(out_path, optimize=True)
    print(name, "bbox:", bbox, "crop box:", box, "-> saved", out_path, resized.size)
