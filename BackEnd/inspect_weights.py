import torch

try:
    path = "model_weights.pth"
    state_dict = torch.load(path, map_location="cpu")
    print("Keys in model_weights.pth:")
    for key in list(state_dict.keys())[:10]:
        print(key)
    print(f"... and {len(state_dict)} more keys.")
except Exception as e:
    print(f"Failed to load: {e}")
