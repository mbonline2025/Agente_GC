import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/api/mbia";
import { Loader2, File as FileIcon, X, Upload } from "lucide-react";
import { toast } from "sonner";

const FileUploader: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const validFiles = fileArray.filter(
        (file) =>
          file.type === "application/pdf" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );

      if (validFiles.length !== fileArray.length) {
        toast.error("Apenas arquivos .pdf e .docx são permitidos");
      }

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await Promise.all(selectedFiles.map((file) => uploadFile(file)));
      toast.success("Arquivos enviados com sucesso!");
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Erro ao enviar arquivos. Por favor, tente novamente.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-muted rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Upload de Documentos</h2>

      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors bg-background">
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center cursor-pointer"
        >
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste arquivos ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Formatos aceitos: PDF, DOCX
          </p>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Arquivos Selecionados:</h3>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-muted p-3 rounded-lg border border-border"
              >
                <div className="flex items-center">
                  <FileIcon className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm truncate max-w-[200px] text-foreground">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Arquivos"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
