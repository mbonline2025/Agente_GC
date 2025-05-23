import os
from docx import Document
import fitz  # PyMuPDF

def extrair_texto_pdf(path):
    """Extrai texto de um arquivo PDF."""
    texto = ''
    try:
        with fitz.open(path) as doc:
            for page in doc:
                texto += page.get_text()
    except Exception as e:
        print(f"Erro ao extrair texto do PDF {path}: {e}")
        texto = ''
    return texto.strip()

def extrair_texto_docx(path):
    """Extrai texto de um arquivo DOCX."""
    texto = ''
    try:
        doc = Document(path)
        texto = '\n'.join(paragraph.text for paragraph in doc.paragraphs if paragraph.text)
    except Exception as e:
        print(f"Erro ao extrair texto do DOCX {path}: {e}")
        texto = ''
    return texto.strip()

def carregar_documentos(pasta='data/documentos'):
    """Carrega e processa documentos PDF e DOCX de um diretório."""
    documentos = []
    
    if not os.path.exists(pasta):
        print(f"Diretório não encontrado: {pasta}")
        return documentos
    
    extensoes_validas = ('.pdf', '.docx')
    
    for raiz, _, arquivos in os.walk(pasta):
        for nome in arquivos:
            if not nome.lower().endswith(extensoes_validas):
                continue
                
            caminho = os.path.join(raiz, nome)
            
            # Extrai texto conforme o tipo de arquivo
            if nome.lower().endswith(".pdf"):
                texto = extrair_texto_pdf(caminho)
            else:  # DOCX
                texto = extrair_texto_docx(caminho)
            
            # Filtra documentos vazios ou muito pequenos
            if texto and len(texto.strip()) > 100:
                documentos.append({
                    "arquivo": nome, 
                    "texto": texto,
                    "caminho": caminho
                })
                print(f"Documento processado: {nome}")
            else:
                print(f"Documento ignorado (vazio ou pequeno): {nome}")
    
    return documentos