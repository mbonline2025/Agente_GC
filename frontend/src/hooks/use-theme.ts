import { useState, useEffect } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Verifica se estamos no cliente (não no servidor)
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("theme") as Theme | null;
      // Verifica se o valor salvo é válido
      const initial: Theme = saved && ["light", "dark"].includes(saved) 
        ? saved 
        : "light";
      
      setTheme(initial);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(initial);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      // Fallback para o tema padrão
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    
    try {
      localStorage.setItem("theme", next);
    } catch (error) {
      console.error("Error saving theme to localStorage:", error);
    }
  };

  return { theme, toggleTheme };
};