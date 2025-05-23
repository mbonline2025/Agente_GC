import requests as http_requests
import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient

GOOGLE_PROJECT_ID = "iagovernanca-12e0b"  # Firebase project ID
ALLOWED_DOMAIN = "mbconsultoria.com"

def verify_token(authorization: str = Header(...)):
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Formato de autenticação inválido")

        # Para tokens do Firebase, use este endpoint
        jwks_url = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded_token = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=GOOGLE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{GOOGLE_PROJECT_ID}",
        )

        return {
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture")
        }

    except Exception as e:
        print(f"[AUTH] Erro manual de verificação Firebase: {e}")
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")
