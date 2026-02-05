import torch
import numpy as np
import cv2
import os
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

try:
    from facenet_pytorch import MTCNN
except ImportError:
    MTCNN = None

# ---------------- CONFIG ----------------
MODEL_ID = "Organika/sdxl-detector"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ---------------- MAIN CLASS ----------------
class EnsembleFakeImageDetector:
    def __init__(self):
        print(f"[INFO] Initializing Ensemble Detector on {DEVICE}")

        # 1. SDXL HuggingFace model
        self.processor = AutoImageProcessor.from_pretrained(MODEL_ID)
        self.model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
        self.model.to(DEVICE)
        self.model.eval()

        # 2. Face detector
        if MTCNN:
            self.mtcnn = MTCNN(keep_all=False, device=DEVICE).eval()
        else:
            self.mtcnn = None
            print("[WARNING] MTCNN not available")

    # ---------- HELPER 1: EXIF CHECK ----------
    def has_exif(self, img: Image.Image) -> bool:
        try:
            exif = img.getexif()
            return exif is not None and len(exif) > 5
        except Exception:
            return False

    # ---------- HELPER 2: NOISE ANALYSIS ----------
    def noise_variance(self, img_path, face_crop=None):
        try:
            if face_crop:
                img = cv2.cvtColor(np.array(face_crop), cv2.COLOR_RGB2GRAY)
            else:
                img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)

            if img is None:
                return 0.0

            return cv2.Laplacian(img, cv2.CV_64F).var()
        except Exception:
            return 0.0

    # ---------- HELPER 3: FACE CONSISTENCY ----------
    def detect_face_crop(self, img_pil):
        if not self.mtcnn:
            return None
        try:
            boxes, _ = self.mtcnn.detect(img_pil)
            if boxes is not None:
                box = boxes[0]
                return img_pil.crop(box)
        except Exception:
            pass
        return None

    # ---------- MAIN ANALYZE ----------
    def analyze(self, image_path: str):
        try:
            img = Image.open(image_path).convert("RGB")
        except Exception as e:
            print(f"[ERROR] Image load failed: {e}")
            return self._error_result()

        # ---------------- SDXL MODEL ----------------
        inputs = self.processor(images=img, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)

        sdxl_ai_prob = probs[0][1].item()  # AI
        sdxl_real_prob = probs[0][0].item()

        # ---------------- EXIF ----------------
        exif_present = self.has_exif(img)

        # ---------------- FACE & NOISE ----------------
        face_crop = self.detect_face_crop(img)
        noise = self.noise_variance(image_path, face_crop)

        # ---------------- SCORING SYSTEM ----------------
        score = 0.5  # neutral baseline

        # SDXL model (soft weight)
        score += (sdxl_real_prob - sdxl_ai_prob) * 0.35

        # EXIF
        if exif_present:
            score += 0.25
        else:
            score -= 0.15

        # Noise
        if noise > 300:
            score += 0.25
        elif noise > 150:
            score += 0.10
        else:
            score -= 0.20

        # Clamp
        score = max(0.0, min(1.0, score))

        # ---------------- FINAL VERDICT ----------------
        if score >= 0.75:
            verdict = "LIKELY_REAL"
        elif score <= 0.30:
            verdict = "LIKELY_AI_GENERATED"
        else:
            verdict = "UNCERTAIN"
        confidence = (1 - abs(score - 0.5)) * 100

        return {
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "score": round(score, 3),
            "signals": {
                "sdxl_ai_probability": round(sdxl_ai_prob * 100, 2),
                "exif_present": exif_present,
                "noise_variance": round(noise, 2),
                "face_detected": face_crop is not None
            },
            "note": "Ensemble AI analysis. Portrait photos & edited images may resemble AI."
        }

    def _error_result(self):
        return {
            "verdict": "ERROR",
            "confidence": 0.0,
            "score": 0.0
        }
