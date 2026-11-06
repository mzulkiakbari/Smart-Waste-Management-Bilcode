import io
import json
import time
import logging
from pathlib import Path
from contextlib import asynccontextmanager

import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

SERVICE_DIR = Path(__file__).resolve().parent
MODEL_PATH = SERVICE_DIR / "model" / "waste_classifier.pth"
CLASS_INDICES_PATH = SERVICE_DIR / "model" / "class_indices.json"

IMG_SIZE = 224
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

model = None
class_names = {}
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, class_names
    logger.info("Initializing Smart Waste ML Model...")

    if not MODEL_PATH.exists():
        logger.warning(f"Model file not found at {MODEL_PATH}. Prediction might fail until trained.")
    else:
        with open(CLASS_INDICES_PATH, "r") as f:
            idx_dict = json.load(f)
        class_names = {int(k): v.replace("_", " ") for k, v in idx_dict.items()}

        num_classes = len(class_names)
        m = models.mobilenet_v2(weights=None)
        in_features = m.classifier[1].in_features
        m.classifier = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(p=0.2),
            nn.Linear(128, num_classes)
        )
        m.load_state_dict(torch.load(str(MODEL_PATH), map_location=device))
        m = m.to(device)
        m.eval()
        model = m
        logger.info(f"Model loaded successfully on {device}. Classes: {list(class_names.values())}")

    yield
    logger.info("ML Service shutting down...")

app = FastAPI(
    title="Smart Waste AI Classification API",
    description="Machine Learning REST API using PyTorch MobileNetV2 for waste classification (Organic, Plastic, Paper).",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Smart Waste Classification API",
        "framework": "PyTorch + FastAPI",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict",
            "docs": "GET /docs"
        }
    }

@app.get("/health")
def health():
    return {
        "status": "healthy" if model is not None else "degraded (model not loaded)",
        "model_loaded": model is not None,
        "device": str(device),
        "classes": list(class_names.values()) if class_names else []
    }

@app.post("/predict")
async def predict_waste(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please train model first.")

    if file.content_type and file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_TYPES}")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Cannot parse image file.")

    t0 = time.time()
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor)
        probs = F.softmax(output, dim=1)[0].cpu().numpy()

    idx = int(probs.argmax())
    confidence = float(probs[idx])
    inference_ms = round((time.time() - t0) * 1000, 2)

    prob_dict = {class_names[i]: round(float(probs[i]), 4) for i in range(len(probs))}

    return {
        "category": class_names[idx],
        "confidence": round(confidence, 4),
        "probabilities": prob_dict,
        "inference_time_ms": inference_ms
    }
