import os
import json
from PIL import Image

# Конфигурация
GALLERY_DIR = 'assets/gallery'
OUTPUT_JSON = 'data/gallery.json'
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


def generate():
    data = []
    if not os.path.exists('data'): os.makedirs('data')

    files = [f for f in os.listdir(GALLERY_DIR) if os.path.splitext(f)[1].lower() in EXTENSIONS]
    print(f"Обработка {len(files)} файлов...")

    for filename in files:
        path = os.path.join(GALLERY_DIR, filename)
        try:
            with Image.open(path) as img:
                width, height = img.size
                data.append({
                    "src": filename,
                    "w": width,
                    "h": height
                })
        except Exception as e:
            print(f"Ошибка с файлом {filename}: {e}")

    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Готово! data/gallery.json обновлен.")


if __name__ == "__main__":
    generate()
