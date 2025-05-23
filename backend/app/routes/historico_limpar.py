from fastapi import APIRouter, Depends, HTTPException
from app.auth import verify_token
import pandas as pd
import os

router = APIRouter()

@router.delete("/ask/historico", tags=["Histórico"])
def limpar_historico(user=Depends(verify_token)):
    try:
        caminho = "logs/historico_conversas.csv"
        if not os.path.exists(caminho):
            raise HTTPException(status_code=404, detail="Arquivo de histórico não encontrado.")

        df = pd.read_csv(caminho)

        # Filtra fora as conversas do usuário
        df_filtrado = df[df["email"] != user["email"]]
        df_filtrado.to_csv(caminho, index=False)

        return {"mensagem": "Histórico do usuário limpo com sucesso."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao limpar histórico: {type(e).__name__} - {str(e)}")
