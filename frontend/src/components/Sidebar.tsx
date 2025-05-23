import {
  LogOut,
  Plus,
  Sun,
  Moon,
  Settings,
  Trash2,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import mbLogo from "/mb-consultoria.png";
import { useEffect, useState } from "react";

interface ChatResumo {
  chat_id: string;
  titulo: string;
  timestamp: string;
}

const SidebarContent = ({
  conversas,
  onSelect,
  onNew,
  onClear
}: {
  conversas: ChatResumo[];
  onSelect: (id: string) => void;
  onNew: () => void;
  onClear: () => void;
}) => {
  const user = JSON.parse(localStorage.getItem("mbia_user") || "{}");
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-background text-foreground flex flex-col justify-between border-r border-border shadow-sm">
      <div>
        <div className="p-4 border-b border-border flex items-center gap-2">
          <img src={mbLogo} className="h-8" alt="MB Consultoria" />
          <span className="font-bold text-primary text-sm">MB.IA</span>
        </div>

        <div className="p-4 space-y-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={onNew}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Chat
            </Button>
            <Button variant="outline" size="icon" onClick={onClear} title="Limpar histórico local">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Histórico</p>
            <ul className="space-y-1 text-sm max-h-[45vh] overflow-y-auto">
              {conversas.map((chat) => (
                <li
                  key={chat.chat_id}
                  onClick={() => onSelect(chat.chat_id)}
                  className="cursor-pointer px-3 py-1.5 rounded-md hover:bg-muted truncate"
                  title={chat.titulo}
                >
                  {chat.titulo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <img src={user?.photoURL} className="h-8 w-8 rounded-full" alt="Usuário" />
          <div className="text-xs overflow-hidden">
            <p className="font-medium truncate">{user?.name}</p>
            <p className="text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={toggleTheme} variant="ghost" size="icon" title="Alternar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Link to="/admin">
            <Button variant="ghost" size="icon" title="Admin">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            variant="ghost"
            size="icon"
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const [conversas, setConversas] = useState<ChatResumo[]>([]);

  useEffect(() => {
    const carregarConversas = async () => {
      try {
        const token = localStorage.getItem("mbia_token");
        const res = await fetch("/api/ask/conversas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setConversas(await res.json());
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
      }
    };

    carregarConversas();
    window.addEventListener("chatAtualizado", carregarConversas);
    return () => window.removeEventListener("chatAtualizado", carregarConversas);
  }, []);

  const handleSelecionarConversa = async (chatId: string) => {
    const token = localStorage.getItem("mbia_token");
    const res = await fetch(`/api/ask/conversa/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      localStorage.setItem("mbia_chat_resposta", JSON.stringify(await res.json()));
      window.dispatchEvent(new Event("chatSelecionado"));
      navigate("/");
    }
  };

  const handleNovaConversa = () => {
    localStorage.removeItem("mbia_chat_resposta");
    window.dispatchEvent(new Event("novaConversa"));
    navigate("/");
  };

  const handleLimparHistorico = () => {
    localStorage.removeItem("mbia_chat_resposta");
    setConversas([]);
  };

  return (
    <>
      {/* Botão mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent
              conversas={conversas}
              onSelect={handleSelecionarConversa}
              onNew={handleNovaConversa}
              onClear={handleLimparHistorico}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:block fixed z-40">
        <SidebarContent
          conversas={conversas}
          onSelect={handleSelecionarConversa}
          onNew={handleNovaConversa}
          onClear={handleLimparHistorico}
        />
      </div>
    </>
  );
};

export default Sidebar;
