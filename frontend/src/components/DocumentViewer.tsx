import React, { useEffect, useState } from "react";
import { getDocumentosIndexados, DocumentoIndexado } from "@/api/mbia";
import { Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const DocumentViewer: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentoIndexado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docs = await getDocumentosIndexados();
        setDocuments(docs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const toggleDocument = (index: number) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-muted rounded-2xl shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Documentos Indexados</h2>
        <p className="text-muted-foreground">
          Nenhum documento foi indexado ainda. Faça upload de arquivos para iniciar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-muted rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Documentos Indexados</h2>

      <div className="space-y-4">
        {documents.map((doc, index) => (
          <div key={index} className="border border-border rounded-xl p-4 bg-muted dark:bg-background">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-foreground max-w-[85%] overflow-hidden">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <div className="max-w-full overflow-x-auto whitespace-nowrap text-sm font-medium truncate">
                  {doc.arquivo}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleDocument(index)}
                className="h-8 w-8 p-0"
              >
                {expandedDocs[index] ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {expandedDocs[index] && (
              <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground whitespace-pre-line max-h-[300px] overflow-y-auto">
                {doc.texto}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
