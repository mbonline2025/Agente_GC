from app.services.indexer import carregar_ou_criar_index, embed
import google.generativeai as genai
import numpy as np
import pandas as pd
from pydantic import BaseModel
from fastapi import APIRouter, Request, Depends, HTTPException
from app.auth import verify_token
from datetime import datetime
import os
import uuid

router = APIRouter()

# Armazena sessões de chat em memória (pode usar Redis em produção)
chat_sessions = {}

class Pergunta(BaseModel):
    pergunta: str
    reset_context: bool = False
    usar_web: bool = False
    chat_id: str | None = None  # suporte a múltiplos chats

@router.post("/")
def responder(pergunta: Pergunta, request: Request, user=Depends(verify_token)):
    try:
        if not pergunta.pergunta.strip():
            raise HTTPException(status_code=400, detail="A pergunta não pode estar vazia.")

        # Define ou cria o chat_id
        chat_id = pergunta.chat_id or datetime.now().strftime("%Y%m%d_%H%M%S") + "_" + uuid.uuid4().hex[:6]

        # Carrega índice e documentos
        index, docs = carregar_ou_criar_index()
        emb = embed(pergunta.pergunta)
        D, I = index.search(np.array([emb]), k=5)
        contexto_interno = "\n---\n".join(docs.iloc[I[0]]["texto"])

        # Inicializa chat Gemini com histórico por chat_id
        session_key = f"{user['email']}:{chat_id}"
        modelo = genai.GenerativeModel("gemini-2.0-flash")

        if pergunta.reset_context or session_key not in chat_sessions:
            chat_sessions[session_key] = modelo.start_chat(history=[
                {"role": "user", "parts": [
                    "Você é um assistente treinado para responder com base em documentos da MB Consultoria. Se necessário, complemente com fontes confiáveis como Renato Bernhoeft, Miguel Gallo ou John Davis."
                ]},
                {"role": "model", "parts": ["Entendido. Pronto para responder com base nesses documentos e fontes."]}
            ])

        chat = chat_sessions[session_key]

        # Monta prompt com base interna
        prompt_base = f"Com base nos documentos internos abaixo, responda com clareza e objetividade:\n\n{contexto_interno}\n\nPergunta: {pergunta.pergunta}"
        resposta_interna = chat.send_message(prompt_base)

        resposta_final = resposta_interna.text
        resposta_externa = None

        if pergunta.usar_web:
            prompt_externo = (
                f"Se for necessário enriquecer a resposta, pesquise informações atualizadas e confiáveis da internet, "
                f"incluindo fontes como Renato Bernhoeft, Miguel Gallo e artigos do site johndavis.com. "
                f"A pergunta é: {pergunta.pergunta}"
            )
            resposta_externa = modelo.generate_content(prompt_externo)

            resposta_final = (
                f"🗂️ **Base Interna**\n{resposta_interna.text}\n\n"
                f"🌍 **Complemento Externo**\n{resposta_externa.text}"
            )

        os.makedirs("logs", exist_ok=True)

        # Log da interação geral
        log_path = "logs/logs.csv"
        log = pd.DataFrame([{
            "timestamp": datetime.now().isoformat(),
            "usuario": user["email"],
            "pergunta": pergunta.pergunta,
            "resposta_interna": resposta_interna.text,
            "resposta_externa": resposta_externa.text if resposta_externa else "",
            "contexto_usado": contexto_interno
        }])
        log.to_csv(log_path, mode="a", header=not os.path.exists(log_path), index=False)

        # Salva a mensagem no histórico por conversa (com chat_id)
        historico_path = "logs/historico_conversas.csv"
        historico = pd.DataFrame([{
            "chat_id": chat_id,
            "email": user["email"],
            "pergunta": pergunta.pergunta,
            "resposta": resposta_final,
            "timestamp": datetime.now().isoformat()
        }])
        historico.to_csv(historico_path, mode="a", header=not os.path.exists(historico_path), index=False)

        return {
            "resposta": resposta_final,
            "usuario": user["email"],
            "chat_id": chat_id
        }

    except Exception as e:
        print(f"[ASK] Erro: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao responder: {type(e).__name__} - {str(e)}")
