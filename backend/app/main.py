from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importações das rotas
from app.routes.ask import router as ask_router
from app.routes.upload import router as upload_router
from app.routes.documentos import router as documentos_router
from app.routes.logs import router as logs_router
from app.routes.teste import router as teste_router
from app.routes.exportar_resposta import router as exportar_router
from app.routes.historico_limpar import router as historico_limpar_router
from app.routes.conversas import router as conversas_router

app = FastAPI(title="MB.IA - Governança Corporativa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de rotas
app.include_router(ask_router, prefix="/api/ask", tags=["Perguntas"])
app.include_router(conversas_router, prefix="/api", tags=["Histórico"])
app.include_router(historico_limpar_router, prefix="/api", tags=["Histórico"])
app.include_router(exportar_router, prefix="/api", tags=["Exportação"])
app.include_router(upload_router, prefix="/api/upload", tags=["Uploads"])
app.include_router(documentos_router, prefix="/api", tags=["Documentos"])
app.include_router(logs_router, prefix="/api", tags=["Logs"])
app.include_router(teste_router)

@app.get("/")
def root():
    return {"MB.IA": "Governança Corporativa API"}
