from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
import pandas as pd
import os

router = APIRouter()

@router.get("/logs", tags=["Logs"])
def listar_logs(user=Depends(verify_token)):
    path = "logs/logs.csv"

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Arquivo de log não encontrado.")

    try:
        if os.path.getsize(path) == 0:
            return {
                "usuario": user["email"],
                "logs": []
            }

        df = pd.read_csv(path)
        df = df.fillna("")

        return {
            "usuario": user["email"],
            "logs": df.to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler os logs: {type(e).__name__} - {str(e)}")
