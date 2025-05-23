import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askQuestion } from "@/api/mbia";
import { Loader2, Send, Paperclip } from "lucide-react";

interface ChatBoxProps {
  onNewMessage?: (question: string, answer: string) => void;
  onUploadClick?: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Estrutura Organizacional e de Governança",
  "Remuneração e Benefícios",
  "Acordos Societários e de Acionistas",
  "Estrutura Societária e Propriedade",
  "Cargos e Responsabilidades",
  "Governança Corporativa",
  "Processos de Consultoria"
];

const ChatBox: React.FC<ChatBoxProps> = ({ onNewMessage, onUploadClick }) => {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const response = await askQuestion(question, true);
      onNewMessage?.(question, response);
      setQuestion("");
    } catch (error) {
      console.error("❌ Erro ao enviar pergunta:", error);
    } finally {
      setIsLoading(false);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-4 w-full">
      {/* Sugestões */}
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED_QUESTIONS.map((q, index) => (
          <button
            key={index}
            onClick={() => handleSuggestedQuestion(q)}
            className="px-3 py-1 text-sm rounded-full bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Entrada */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta aqui..."
            className="min-h-[48px] max-h-[150px] resize-none rounded-xl border border-border bg-white dark:bg-muted pr-20 pl-4 py-3 shadow-sm focus-visible:ring-1"
            disabled={isLoading}
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onUploadClick}
              title="Enviar arquivos"
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !question.trim()}
              title="Enviar pergunta"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Pressione <kbd className="bg-muted px-1.5 py-0.5 rounded">Enter</kbd> para enviar.
        </p>
      </form>
    </div>
  );
};

export default ChatBox;
