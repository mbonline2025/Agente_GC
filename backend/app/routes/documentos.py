from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
import os
from app.auth import verify_token

router = APIRouter()

@router.get("/documentos/lista", tags=["Documentos"])
def listar_documentos(user=Depends(verify_token)):
    path = "vectordb/documentos.csv"

    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Arquivo documentos.csv não encontrado.")

    try:
        df = pd.read_csv(path)

        # Limita visualização do conteúdo
        if "texto" in df.columns:
            df["texto"] = df["texto"].apply(lambda t: t[:300] + "..." if len(str(t)) > 300 else str(t))

        return {
            "usuario": user["email"],
            "documentos": df.to_dict(orient="records")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler CSV: {type(e).__name__} - {str(e)}")
