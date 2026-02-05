from ml_model import EnsembleFakeImageDetector

_model_instance = None

def get_analyzer():
    global _model_instance
    if _model_instance is None:
        _model_instance = EnsembleFakeImageDetector()
    return _model_instance
