#!/bin/bash

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m' # No Color

# Caminhos absolutos
BACKEND_PATH=$(realpath "$BACKEND_DIR")
FRONTEND_PATH=$(realpath "$FRONTEND_DIR")

# Validação de estrutura
if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
  echo -e "${RED}❌ Um ou ambos os diretórios não existem.${NC}"
  exit 1
fi

if [ "$BACKEND_PATH" == "$FRONTEND_PATH" ]; then
  echo -e "${RED}❌ Backend e frontend estão no mesmo diretório. Encerrando.${NC}"
  exit 1
fi

echo -e "${BLUE}🔧 Verificando dependências...${NC}"

# Backend
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
  pip install -r "$BACKEND_DIR/requirements.txt"
fi

# Frontend
if [ -f "$FRONTEND_DIR/package.json" ]; then
  echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
  cd "$FRONTEND_DIR"
  npm install
  cd -
fi

# Verificação de portas
if lsof -i :8000 > /dev/null; then
  echo -e "${RED}❌ Porta 8000 já está em uso. Encerrando.${NC}"
  exit 1
fi

if lsof -i :5173 > /dev/null; then
  echo -e "${RED}❌ Porta 5173 já está em uso. Encerrando.${NC}"
  exit 1
fi

echo -e "${GREEN}🚀 Iniciando MB.IA...${NC}"

# Finalização segura
cleanup() {
  echo -e "${RED}🛑 Encerrando MB.IA...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit
}
trap cleanup SIGINT SIGTERM

# Iniciar backend
echo -e "${BLUE}🌐 Backend: http://localhost:8000${NC}"
cd "$BACKEND_DIR"
uvicorn app.main:app --reload 2>&1 | tee ../backend.log &
BACKEND_PID=$!
cd -

# Iniciar frontend
echo -e "${BLUE}🖥️  Frontend: http://localhost:5173${NC}"
cd "$FRONTEND_DIR"
npm run dev -- --host 2>&1 | tee ../frontend.log &
FRONTEND_PID=$!
cd -

echo -e "${GREEN}✅ Tudo pronto! Acesse o app em http://localhost:5173${NC}"

# Aguardar os processos
wait $BACKEND_PID
wait $FRONTEND_PID
