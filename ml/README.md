# AgriMind AI — Machine Learning & Research Directory

## Directory Overview

This directory houses datasets, training scripts, evaluation benchmarks, and serialized model artifacts for AgriMind AI:

- `datasets/`: Storage for verified agricultural datasets (raw and preprocessed). Note: Large data files are excluded via `.gitignore`.
- `training/`: Training routines for baseline models (Scikit-learn, XGBoost) and the experimental PyTorch multi-task network.
- `evaluation/`: Benchmark scripts comparing multi-task models against single-task baselines.
- `models/`: Serialized model checkpoints (`.joblib`, `.pt`).

## Governance & Anti-Hallucination Policy
- Datasets must be documented with verified origins before training.
- No synthetic performance metrics ($R^2$, accuracy) may be recorded without reproducible evaluation runs.
- Refer to `documentation/09_ML_AND_AI_DOCUMENTATION.md` for complete protocols.
