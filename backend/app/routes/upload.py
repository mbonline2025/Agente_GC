from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.auth import verify_token
from app.services.indexer import carregar_ou_criar_index
import shutil, os

router = APIRouter()

@router.post("/upload", tags=["Uploads"])
async def upload_arquivo(file: UploadFile = File(...), user=Depends(verify_token)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Arquivo inválido ou não enviado.")

        destino_dir = "data/documentos"
        os.makedirs(destino_dir, exist_ok=True)

        destino = os.path.join(destino_dir, file.filename)

        with open(destino, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Reindexar após upload
        carregar_ou_criar_index()

        print(f"[UPLOAD] {user['email']} fez upload de: {file.filename}")
        return {
            "mensagem": f"Arquivo '{file.filename}' salvo e indexado com sucesso.",
            "usuario": user["email"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {type(e).__name__} - {str(e)}")
