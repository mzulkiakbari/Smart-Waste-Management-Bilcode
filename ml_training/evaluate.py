import os
import json
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

import torch
import torch.nn as nn
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score

SCRIPT_DIR = Path(__file__).resolve().parent
DATASET_DIR = SCRIPT_DIR / "dataset" / "processed"
RESULTS_DIR = SCRIPT_DIR / "results"
MODEL_PATH = SCRIPT_DIR.parent / "ml_service" / "model" / "waste_classifier.pth"
CLASS_INDICES_PATH = SCRIPT_DIR.parent / "ml_service" / "model" / "class_indices.json"

IMG_SIZE = 224
TARGET_ACCURACY = 0.80

def evaluate():
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Evaluating using device: {device}")

    val_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    test_dataset = datasets.ImageFolder(str(DATASET_DIR / "test"), val_transform)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    class_names = test_dataset.classes
    num_classes = len(class_names)

    # Initialize model
    model = models.mobilenet_v2(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(128, num_classes)
    )

    model.load_state_dict(torch.load(str(MODEL_PATH), map_location=device))
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    acc = accuracy_score(all_labels, all_preds)
    cm = confusion_matrix(all_labels, all_preds)
    report_str = classification_report(all_labels, all_preds, target_names=class_names, digits=4)
    report_dict = classification_report(all_labels, all_preds, target_names=class_names, output_dict=True)

    print("\n" + "=" * 50)
    print(f"Overall Test Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print(f"Target Accuracy: {TARGET_ACCURACY*100:.2f}%")
    print(f"Status: {'PASSED [OK]' if acc >= TARGET_ACCURACY else 'NEEDS RETRAIN'}")
    print("=" * 50)
    print("\nClassification Report:\n", report_str)

    # Save confusion matrix plot
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    plt.figure(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=[c.replace("_", " ") for c in class_names],
                yticklabels=[c.replace("_", " ") for c in class_names])
    plt.title(f"Confusion Matrix (Acc: {acc*100:.2f}%)")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.tight_layout()
    plt.savefig(str(RESULTS_DIR / "confusion_matrix.png"), dpi=150)
    plt.close()

    # Save summary json
    summary = {
        "accuracy": float(acc),
        "target_accuracy": TARGET_ACCURACY,
        "passed": bool(acc >= TARGET_ACCURACY),
        "confusion_matrix": cm.tolist(),
        "classification_report": report_dict,
        "class_names": class_names
    }
    with open(RESULTS_DIR / "evaluation_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    with open(RESULTS_DIR / "classification_report.txt", "w") as f:
        f.write(report_str)

    print(f"Reports saved to {RESULTS_DIR}")

if __name__ == "__main__":
    evaluate()
