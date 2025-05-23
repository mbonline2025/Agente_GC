from fastapi import APIRouter, Depends
from app.auth import verify_token

router = APIRouter()

@router.get("/auth/teste")
def teste(user=Depends(verify_token)):
    return {
        "email": user["email"],
        "nome": user.get("name"),
        "imagem": user.get("picture")
    }
