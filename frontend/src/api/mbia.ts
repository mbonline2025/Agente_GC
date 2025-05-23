const API_BASE_URL = "/api";

export interface ChatMessage {
  pergunta: string;
  resposta?: string;
}

export interface LogEntry {
  id?: number;
  pergunta: string;
  resposta: string;
  data: string;
  arquivo?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("mbia_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const askQuestion = async (
  pergunta: string,
  reset_context = false,
  usar_web = true
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ask/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ pergunta, reset_context, usar_web }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.resposta) return data.resposta;
    if (data.erro) return data.erro;
    return "❌ Resposta inesperada do servidor.";
  } catch (error) {
    console.error("Erro ao enviar pergunta:", error);
    throw error;
  }
};

export const uploadFile = async (file: File): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append("file", file); // deve ser 'file' conforme backend

    const token = localStorage.getItem("mbia_token");

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao fazer upload de arquivo:", error);
    throw error;
  }
};

export const getLogs = async (): Promise<LogEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logs`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    throw error;
  }
};

export interface DocumentoIndexado {
  arquivo: string;
  texto: string;
}

export const getDocumentosIndexados = async (): Promise<DocumentoIndexado[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/documentos/lista`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.documentos || [];
  } catch (error) {
    console.error("Erro ao buscar documentos indexados:", error);
    throw error;
  }
};
