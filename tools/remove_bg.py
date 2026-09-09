import glob, os, time
from rembg import remove
from PIL import Image

SRC_DIR = r"C:\Users\Administrador\OneDrive\Desktop\Bozeo advogacia\fotos - textos advogados - bozeo"
OUT_DIR = os.path.join(os.path.dirname(__file__), "equipe-raw")
os.makedirs(OUT_DIR, exist_ok=True)

jobs = [
    ("Rômulo*.jpeg", "romulo.png", 2),   # variante (2) = terno azul
    ("Amanda*.jpeg", "amanda.png", 2),   # variante (2) = fundo liso
    ("Ingrid*.jpeg", "ingrid.png", 1),
    ("Juliana*.jpeg", "juliana.png", 1),
]

for pattern, outname, pick in jobs:
    matches = sorted(glob.glob(os.path.join(SRC_DIR, pattern)))
    if not matches:
        print("SEM MATCH:", pattern)
        continue
    # pick=1 -> arquivo sem sufixo "(2)"; pick=2 -> o que tem "(2)" no nome
    if pick == 2:
        src = next((m for m in matches if "(2)" in os.path.basename(m)), matches[0])
    else:
        src = next((m for m in matches if "(2)" not in os.path.basename(m)), matches[0])
    t0 = time.time()
    img = Image.open(src)
    out = remove(img)
    dest = os.path.join(OUT_DIR, outname)
    out.save(dest)
    print(f"{os.path.basename(src)} -> {outname}  ({time.time()-t0:.1f}s, {out.size})")
