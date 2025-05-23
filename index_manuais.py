from app.services.indexer import carregar_ou_criar_index

if __name__ == "__main__":
    index, df = carregar_ou_criar_index("backend/data/documentos/Manuais e Práticas")
    print(f"✅ Index criado com {len(df)} documentos e {index.ntotal} vetores.")
