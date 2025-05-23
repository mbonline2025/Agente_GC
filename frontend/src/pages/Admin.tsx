import React, { useState } from "react";
import LogViewer from "@/components/LogViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, FileDown } from "lucide-react";
import { Link } from "react-router-dom";
import mbLogo from "/mb-consultoria.png";

const Admin: React.FC = () => {
  const [forceReset, setForceReset] = useState(false);

  const handleResetLogs = async () => {
    try {
      const token = localStorage.getItem("mbia_token");
      const res = await fetch("/api/ask/historico", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        alert("Histórico limpo com sucesso.");
        setForceReset(prev => !prev); // força recarregamento do LogViewer
        window.dispatchEvent(new Event("chatAtualizado")); // atualiza Sidebar
      } else {
        alert("Falha ao limpar histórico.");
      }
    } catch (error) {
      console.error("Erro ao limpar histórico:", error);
    }
  };

  const handleExportarCSV = () => {
    window.open("/api/logs", "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header fixo e responsivo */}
      <header className="border-b border-border py-3 px-4 sm:px-6 bg-white dark:bg-background mb-6 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-center sm:text-left">
            <img src={mbLogo} alt="MB Consultoria Logo" className="h-6" />
            <h1 className="text-xl font-bold text-primary">Painel Administrativo</h1>
          </div>

          <div className="hidden sm:block w-28" />
        </div>
      </header>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 space-y-6 pb-12">
        
        {/* Logs de Interações */}
        <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Histórico de Interações</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportarCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleResetLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          <LogViewer forceReset={forceReset} />
        </div>

        {/* Configurações da IA */}
        <div className="bg-white dark:bg-muted rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Configurações Avançadas</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
            <li>Gerenciar sessão de chat (limpar histórico do usuário)</li>
            <li>Exportar logs de interação para análise</li>
            <li>Futuramente: gerenciamento de permissões, tokens e configurações da IA</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Admin;
