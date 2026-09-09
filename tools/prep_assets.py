import os
from PIL import Image

HERE = os.path.dirname(__file__)
LOGO_SRC = r"C:\Users\Administrador\OneDrive\Desktop\Bozeo advogacia\LOGO - BOZEO"
LOGO_OUT = os.path.join(HERE, "logo")

# --- 1) Fotos da equipe: PNG grande (com alpha) -> WebP leve, mesma transparência ---
team_files = ["romulo.png", "amanda.png", "ingrid.png", "juliana.png"]
for name in team_files:
    src = os.path.join(HERE, name)
    img = Image.open(src).convert("RGBA")
    dest = os.path.join(HERE, name.replace(".png", ".webp"))
    img.save(dest, "WEBP", quality=84, method=6)
    before = os.path.getsize(src)
    after = os.path.getsize(dest)
    print(f"{name}: {before/1024:.0f}KB -> {os.path.basename(dest)}: {after/1024:.0f}KB")
    os.remove(src)

# --- 2) Logos: redimensiona pra tamanhos de uso real no site e salva como WebP ---
jobs = [
    ("Logo_Padrão.png", "bozeo-logo.webp", 640),               # header claro / footer (nao usado, footer é escuro)
    ("Logo_Padrão_Branco.png", "bozeo-logo-branco.webp", 640),  # header transparente sobre hero + footer
    ("Logo_Simbolo.png", "bozeo-simbolo.webp", 480),            # favicon base / usos claros
    ("Logo_Simbolo_BRanco.png", "bozeo-simbolo-branco.webp", 480),  # selo da intro, fundo escuro
]
os.makedirs(LOGO_OUT, exist_ok=True)
for src_name, out_name, target_w in jobs:
    src = os.path.join(LOGO_SRC, src_name)
    img = Image.open(src).convert("RGBA")
    ratio = target_w / img.width
    target_h = round(img.height * ratio)
    resized = img.resize((target_w, target_h), Image.LANCZOS)
    dest = os.path.join(LOGO_OUT, out_name)
    resized.save(dest, "WEBP", quality=95, method=6, lossless=False)
    print(f"{src_name} -> {out_name} {resized.size}  {os.path.getsize(dest)/1024:.0f}KB")

# --- 3) Favicon PNG (16/32/180 nao dá pra multi-size em webp p/ <link>, gera PNG pequeno) ---
sym = Image.open(os.path.join(LOGO_SRC, "Logo_Simbolo.png")).convert("RGBA")
# fundo escuro da marca atrás do símbolo, quadrado, cantos levemente arredondados via crop simples
bg = Image.new("RGBA", (256, 256), (22, 24, 29, 255))
ratio = 176 / sym.width
sw, sh = 176, round(sym.height * ratio)
sym_small = sym.resize((sw, sh), Image.LANCZOS)
bg.alpha_composite(sym_small, ((256 - sw) // 2, (256 - sh) // 2))
bg.save(os.path.join(LOGO_OUT, "favicon.png"))
print("favicon.png gerado")
