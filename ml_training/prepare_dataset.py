import os
import sys
import shutil
import random
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_DIR = SCRIPT_DIR / "dataset"
PROCESSED_DIR = DATASET_DIR / "processed"

# Sesuai folder dataset aktual: 'biological' adalah organic waste
CATEGORY_MAPPING = {
    "Organic_Waste": ["biological"],
    "Plastic_Waste": ["plastic"],
    "Paper_Waste": ["paper", "cardboard"],
}

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15
MAX_IMAGES_PER_CATEGORY = 400
RANDOM_SEED = 42

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

def find_image_dirs(base_path):
    all_source_names = set()
    for sources in CATEGORY_MAPPING.values():
        all_source_names.update(sources)
    found = {}
    for root, dirs, files in os.walk(base_path):
        dir_name = Path(root).name.lower().replace("-", "_").strip()
        if dir_name in all_source_names:
            images = [f for f in files if Path(f).suffix.lower() in VALID_EXTENSIONS]
            if images:
                found[dir_name] = (root, images)
                print(f"      Found category folder: {dir_name}/ ({len(images)} images)")
    return found

def organize_dataset(source_path):
    random.seed(RANDOM_SEED)
    print("\n[Organizing Dataset]")
    found_dirs = find_image_dirs(source_path)
    if not found_dirs:
        print("ERROR: No matching category folders found!")
        sys.exit(1)

    if PROCESSED_DIR.exists():
        shutil.rmtree(PROCESSED_DIR)

    for split in ["train", "val", "test"]:
        for cat in CATEGORY_MAPPING:
            (PROCESSED_DIR / split / cat).mkdir(parents=True, exist_ok=True)

    stats = {}
    for target_cat, src_names in CATEGORY_MAPPING.items():
        all_images = []
        for src in src_names:
            if src in found_dirs:
                src_dir, files = found_dirs[src]
                for f in files:
                    all_images.append(Path(src_dir) / f)

        random.shuffle(all_images)
        if len(all_images) > MAX_IMAGES_PER_CATEGORY:
            all_images = all_images[:MAX_IMAGES_PER_CATEGORY]

        n = len(all_images)
        n_train = int(n * TRAIN_RATIO)
        n_val = int(n * VAL_RATIO)

        splits = {
            "train": all_images[:n_train],
            "val": all_images[n_train:n_train + n_val],
            "test": all_images[n_train + n_val:],
        }

        for split_name, img_list in splits.items():
            dst_dir = PROCESSED_DIR / split_name / target_cat
            for idx, img_p in enumerate(img_list):
                ext = img_p.suffix.lower()
                dst_file = dst_dir / f"{target_cat.lower()}_{idx:04d}{ext}"
                shutil.copy2(str(img_p), str(dst_file))

        stats[target_cat] = {
            "total": n,
            "train": len(splits["train"]),
            "val": len(splits["val"]),
            "test": len(splits["test"]),
        }

    print("\n" + "=" * 55)
    print(f"{'Category':<20} {'Total':>8} {'Train':>8} {'Val':>8} {'Test':>8}")
    print("-" * 55)
    for cat, s in stats.items():
        print(f"{cat:<20} {s['total']:>8} {s['train']:>8} {s['val']:>8} {s['test']:>8}")
    print("=" * 55)

if __name__ == "__main__":
    import kagglehub
    print("Downloading/Locating dataset...")
    path = kagglehub.dataset_download("mostafaabla/garbage-classification")
    organize_dataset(path)
