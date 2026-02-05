import cv2
import numpy as np

def calculate_noise(image_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Failed to load {image_path}")
        return
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    print(f"Noise Variance for {image_path}: {variance}")

# Path to the generated fake image
fake_image_path = r"C:\Users\HYDER DANISH\.gemini\antigravity\brain\c76ec1ae-5b80-49e9-b864-4c3c1129472c\fake_person_portrait_1770186431177.png"
calculate_noise(fake_image_path)
