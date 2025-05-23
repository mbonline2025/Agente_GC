from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
import pandas as pd
import os
from typing import List

router = APIRouter()

HISTORICO_PATH = "logs/historico_conversas.csv"

@router.get("/ask/historico", tags=["Histórico"])
def listar_historico(user=Depends(verify_token)) -> List[dict]:
    if not os.path.exists(HISTORICO_PATH):
        raise HTTPException(status_code=404, detail="Nenhum histórico encontrado.")

    try:
        df = pd.read_csv(HISTORICO_PATH)
        df_user = df[df["email"] == user["email"]].sort_values(by="timestamp", ascending=False)

        if df_user.empty:
            raise HTTPException(status_code=404, detail="Você ainda não possui chats salvos.")

        def gerar_titulo(texto):
            return texto.strip().split("\n")[0][:50] + ("..." if len(texto) > 50 else "")

        historico = [
            {
                "id": row["timestamp"].replace(":", "-"),
                "titulo": gerar_titulo(row["pergunta"]),
                "pergunta": row["pergunta"],
                "resposta": row["resposta"],
                "timestamp": row["timestamp"]
            }
            for _, row in df_user.iterrows()
        ]

        return historico

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao carregar histórico: {str(e)}")
