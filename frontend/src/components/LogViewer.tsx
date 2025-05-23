import React, { useEffect, useState } from "react";
import { getLogs, LogEntry } from "@/api/mbia";
import { Loader2, FileText, Calendar, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LogViewerProps {
  forceReset?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({ forceReset }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const logData = await getLogs();
      setLogs(logData);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [forceReset]);

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return "Sem data";
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-muted rounded-2xl shadow-md p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Histórico de Perguntas</h2>
        <p className="text-muted-foreground">Nenhuma pergunta foi feita ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-muted rounded-2xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Histórico de Perguntas</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border border-border rounded-xl p-4 bg-background">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(log.data)}</span>
              {log.arquivo && (
                <>
                  <span className="mx-1">•</span>
                  <FileText className="h-4 w-4" />
                  <span className="truncate">{log.arquivo}</span>
                </>
              )}
            </div>
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg border border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pergunta:</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{log.pergunta}</p>
                  </div>
                </div>
              </div>
              <div className="bg-accent p-3 rounded-lg border border-border">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Resposta:</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{log.resposta}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogViewer;
