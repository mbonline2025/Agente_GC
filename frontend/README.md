# 📘 MB.IA - Instruções de Inicialização e Atualização

Este guia descreve como preparar e iniciar o projeto **MB.IA**, incluindo o setup de dependências, execução de backend e frontend, e a reindexação das bases de conhecimento.

---

## 🚀 Inicialização Automática com Script Bash

### Arquivo: `start-mbia.sh`

```bash
#!/bin/bash

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

# Resolve caminhos absolutos
BACKEND_PATH=$(realpath "$BACKEND_DIR")
FRONTEND_PATH=$(realpath "$FRONTEND_DIR")

# Verifica se os diretórios são o mesmo
if [ "$BACKEND_PATH" == "$FRONTEND_PATH" ]; then
  echo "❌ Backend e frontend estão no mesmo diretório. Encerrando para evitar conflitos."
  exit 1
fi

echo "🔧 Verificando dependências..."

# Backend setup
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
  echo "📦 Instalando dependências do backend..."
  pip install -r "$BACKEND_DIR/requirements.txt"
fi

# Frontend setup
if [ -f "$FRONTEND_DIR/package.json" ]; then
  echo "📦 Instalando dependências do frontend..."
  cd "$FRONTEND_DIR"
  npm install
  cd -
fi

echo "🚀 Iniciando MB.IA..."

# Iniciar backend
echo "🌐 Backend: http://localhost:8000"
cd "$BACKEND_DIR"
uvicorn app.main:app --reload &
cd -

# Iniciar frontend
echo "🖥️  Frontend: http://localhost:8080"
cd "$FRONTEND_DIR"
npm run dev &
cd -

echo "✅ Tudo pronto! Acesse o app em http://localhost:8080"
```

---

## 🧠 Reindexação da Base de Manuais e Práticas

Para atualizar o banco vetorial com os documentos de boas práticas (IBGC, guias, etc), execute:

### 1. Certifique-se de estar na raiz do projeto:

```bash
cd MBIA_Monorepo_Completo
```

### 2. Execute o script com PYTHONPATH correto:

```bash
PYTHONPATH=backend python index_manuais.py
```

### 3. Resultado esperado:

Gera:

* `backend/vectordb/index_manuais.faiss`
* `backend/vectordb/documentos_manuais.csv`

Esses arquivos são usados pelo `askQuestion()` para enriquecer as respostas da IA com fontes externas.

---

## ✅ Dependências obrigatórias do backend

Se estiver rodando o backend manualmente, não se esqueça de instalar:

```bash
pip install PyPDF2 sentence-transformers faiss-cpu pandas
```

---

## 🧪 Testando a IA via script Python

No Python shell ou script:

```python
from app.routes.ask import askQuestion
resposta = askQuestion("Quais são as recomendações para estrutura do conselho?")
print(resposta)
```