import os
import faiss
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import google.generativeai as genai
from app.services.extractor import carregar_documentos

load_dotenv()
genai.configure(api_key=os.getenv("VITE_GEMINI_API_KEY"))

INDEX_PATHS = [
    "vectordb/index.faiss",
    "vectordb/index_manuais.faiss"
]
CSV_PATHS = [
    "vectordb/documentos.csv",
    "vectordb/documentos_manuais.csv"
]

def embed(texto):
    resp = genai.embed_content(
        model="models/embedding-001",
        content=texto[:8000],
        task_type="retrieval_document"
    )
    return np.array(resp["embedding"], dtype="float32")

def carregar_ou_criar_index(pasta='data/documentos'):
    indices = []
    dataframes = []

    for index_path, csv_path in zip(INDEX_PATHS, CSV_PATHS):
        if os.path.exists(index_path) and os.path.exists(csv_path):
            idx = faiss.read_index(index_path)
            df = pd.read_csv(csv_path)
            indices.append(idx)
            dataframes.append(df)

    if not indices:
        docs = carregar_documentos(pasta)
        print(f"📄 Documentos encontrados: {len(docs)}")
        vetores = []
        documentos_validos = []

        for d in docs:
            texto = d["texto"]
            nome = d["arquivo"]
            print(f"🧪 {nome} → {len(texto)} caracteres")
            if texto and len(texto.strip()) > 100:
                try:
                    emb = embed(texto)
                    vetores.append(emb)
                    documentos_validos.append(d)
                    print(f"✅ Indexado: {nome}")
                except Exception as e:
                    print(f"❌ Erro ao indexar {nome}: {e}")
            else:
                print(f"⚠️ Ignorado (vazio ou insuficiente): {nome}")

        if not vetores:
            raise ValueError("❌ Nenhum documento válido foi encontrado para indexar.")

        matriz = np.vstack(vetores)
        index = faiss.IndexFlatL2(matriz.shape[1])
        index.add(matriz)
        os.makedirs("vectordb", exist_ok=True)
        faiss.write_index(index, INDEX_PATHS[0])
        df = pd.DataFrame(documentos_validos)
        df.to_csv(CSV_PATHS[0], index=False)
        print("✅ Indexação concluída com sucesso.")
        return index, df

    merged_index = indices[0]
    for idx in indices[1:]:
        merged_index.merge_from(idx)

    merged_df = pd.concat(dataframes, ignore_index=True)
    return merged_index, merged_df
