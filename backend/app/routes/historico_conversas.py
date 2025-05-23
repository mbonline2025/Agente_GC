from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
import pandas as pd
import os
from datetime import datetime

router = APIRouter()
HISTORICO_PATH = "logs/historico_conversas.csv"

# Cria o arquivo se não existir
if not os.path.exists("logs"):
    os.makedirs("logs")
if not os.path.exists(HISTORICO_PATH):
    pd.DataFrame(columns=["email", "pergunta", "resposta", "timestamp"]).to_csv(HISTORICO_PATH, index=False)

@router.get("/ask/ultima", tags=["Perguntas"])
def obter_ultima_conversa(user=Depends(verify_token)):
    try:
        if not os.path.exists(HISTORICO_PATH):
            raise HTTPException(status_code=404, detail="Nenhuma conversa encontrada.")

        df = pd.read_csv(HISTORICO_PATH)
        df_user = df[df["email"] == user["email"]].sort_values(by="timestamp", ascending=False)

        if df_user.empty:
            raise HTTPException(status_code=404, detail="Nenhuma conversa encontrada para este usuário.")

        ultima = df_user.iloc[0]
        return {
            "pergunta": ultima["pergunta"],
            "resposta": ultima["resposta"],
            "timestamp": ultima["timestamp"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico: {str(e)}")
