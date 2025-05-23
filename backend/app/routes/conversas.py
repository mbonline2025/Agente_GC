from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
import pandas as pd
import os

router = APIRouter()

HISTORICO_PATH = "logs/historico_conversas.csv"

@router.get("/ask/conversas", tags=["Histórico"])
def listar_conversas(user=Depends(verify_token)):
    if not os.path.exists(HISTORICO_PATH):
        return []

    try:
        df = pd.read_csv(HISTORICO_PATH)
        df_user = df[df["email"] == user["email"]]

        if df_user.empty:
            return []

        grupos = df_user.groupby("chat_id").first().reset_index()

        def gerar_titulo(texto):
            return texto.strip().split("\n")[0][:50] + ("..." if len(texto) > 50 else "")

        return [
            {
                "chat_id": row["chat_id"],
                "titulo": gerar_titulo(row["pergunta"]),
                "timestamp": row["timestamp"]
            }
            for _, row in grupos.iterrows()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar conversas: {str(e)}")


@router.get("/ask/conversa/{chat_id}", tags=["Histórico"])
def obter_conversa(chat_id: str, user=Depends(verify_token)):
    if not os.path.exists(HISTORICO_PATH):
        raise HTTPException(status_code=404, detail="Nenhum histórico encontrado.")

    try:
        df = pd.read_csv(HISTORICO_PATH)
        df_chat = df[(df["email"] == user["email"]) & (df["chat_id"] == chat_id)]
        if df_chat.empty:
            raise HTTPException(status_code=404, detail="Conversa não encontrada.")

        df_chat = df_chat.sort_values(by="timestamp")

        return [
            {
                "pergunta": row["pergunta"],
                "resposta": row["resposta"],
                "timestamp": row["timestamp"]
            }
            for _, row in df_chat.iterrows()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao recuperar conversa: {str(e)}")
