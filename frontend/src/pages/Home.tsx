import React, { useEffect, useState } from "react";
import ChatBox from "@/components/ChatBox";
import FileUploader from "@/components/FileUploader";
import DocumentViewer from "@/components/DocumentViewer";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileUp } from "lucide-react";

interface Conversation {
  question: string;
  answer: string;
}

const Home: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  const [activeTab, setActiveTab] = useState("chat");

  const handleNewMessage = (question: string, answer: string) => {
    setChatHistory((prev) => [...prev, { question, answer }]);
    setActiveTab("chat");
    window.dispatchEvent(new Event("chatAtualizado"));
  };

  const resetChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("mbia_chat_resposta");
  };

  const handleUploadClick = () => {
    resetChatHistory();
    setActiveTab("files");
  };

  useEffect(() => {
    const carregarConversa = () => {
      const saved = localStorage.getItem("mbia_chat_resposta");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (Array.isArray(data)) {
            setChatHistory(data.map((item: any) => ({
              question: item.pergunta,
              answer: item.resposta,
            })));
          } else if (data.pergunta && data.resposta) {
            setChatHistory([{ question: data.pergunta, answer: data.resposta }]);
          }
        } catch (error) {
          console.error("Erro ao carregar chat salvo:", error);
        }
      } else {
        resetChatHistory();
      }
    };

    carregarConversa();
    window.addEventListener("chatSelecionado", carregarConversa);
    window.addEventListener("novaConversa", resetChatHistory);
    return () => {
      window.removeEventListener("chatSelecionado", carregarConversa);
      window.removeEventListener("novaConversa", resetChatHistory);
    };
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar fixa / Drawer mobile */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex-1 pl-0 md:pl-64 flex flex-col">
<header className="sticky top-0 z-20 bg-white dark:bg-background border-b border-border px-4 sm:px-6 py-3">
  <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-screen-xl mx-auto">
    <div className="flex justify-end">
      <TabsList className="gap-2">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="files" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          Documentos
        </TabsTrigger>
      </TabsList>
    </div>
  </Tabs>
</header>



        <main className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            {/* Aba Chat */}
            <TabsContent value="chat" className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-screen-md w-full mx-auto space-y-6">
                {chatHistory.length > 0 ? (
                  chatHistory.map((exchange, index) => (
                    <div key={index} className="space-y-4">
                      {/* Pergunta */}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">U</div>
                        <div className="bg-white dark:bg-muted p-3 rounded-xl border border-border flex-1 text-sm sm:text-base shadow-sm">
                          <p className="whitespace-pre-line">{exchange.question}</p>
                        </div>
                      </div>

                      {/* Resposta */}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-muted text-primary flex items-center justify-center text-sm">I.A</div>
                        <div className="bg-muted p-3 rounded-xl border border-border flex-1 text-sm sm:text-base relative">
                          <p className="whitespace-pre-line">{exchange.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-center max-w-md space-y-2">
                      <h2 className="text-2xl font-bold text-primary">I.A: Governança Corporativa</h2>
                      <p className="text-muted-foreground">Faça perguntas. Estou aqui para ajudar.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full px-4 sm:px-6 py-6 border-t border-border bg-white dark:bg-muted">
                <div className="max-w-screen-md mx-auto">
                  <ChatBox
                    onNewMessage={handleNewMessage}
                    onUploadClick={handleUploadClick}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Documentos */}
            <TabsContent value="files" className="overflow-y-auto py-6 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FileUploader />
                <DocumentViewer />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Home;
