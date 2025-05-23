import React, { useEffect, useState } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import mbLogo from "/mb-consultoria.png";
import { useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  // Aplica o tema ao carregar
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      localStorage.setItem("mbia_token", token);
      localStorage.setItem("mbia_user", JSON.stringify({
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      }));

      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4 relative">
      
      {/* Botão de alternância de tema */}
      <div className="absolute top-4 right-4">
        <Button onClick={toggleTheme} variant="ghost" size="icon" title="Alternar tema">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Cartão de login */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6 text-center">
        <img src={mbLogo} alt="MB Consultoria" className="h-14 mx-auto" />
        <h1 className="text-3xl font-extrabold text-primary">Bem-vindo ao MB.IA</h1>
        <p className="text-muted-foreground text-sm">
          Acesse com sua conta corporativa para continuar
        </p>
        <Button 
          onClick={handleLogin} 
          className="w-full py-2 text-lg font-semibold rounded-xl"
        >
          Entrar com Google
        </Button>
        <p className="text-xs text-muted-foreground">Seu acesso é seguro e criptografado</p>
      </div>
    </div>
  );
};

export default Login;
