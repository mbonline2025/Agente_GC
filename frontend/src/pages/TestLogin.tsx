import React, { useState } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import mbLogo from "/mb-consultoria.png";
import { ClipboardCheck } from "lucide-react";

export default function TestLogin() {
  const [token, setToken] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      setUser(result.user);
      setToken(idToken);

      const res = await fetch("http://localhost:8000/auth/teste", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("Erro no login:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setToken("");
    setResponse(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-border rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex justify-center mb-4">
          <img src={mbLogo} alt="MB Consultoria Logo" className="h-16" />
        </div>
        <h2 className="text-xl font-bold text-center text-primary">
          Teste de Login com Google
        </h2>

        {!user ? (
          <Button onClick={handleLogin} className="w-full">
            Entrar com conta MB
          </Button>
        ) : (
          <>
            <div className="text-center text-sm">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              Sair
            </Button>
          </>
        )}

        {token && (
          <div className="text-xs break-words bg-muted p-2 rounded border border-border mt-4">
            <strong className="text-muted-foreground">Token:</strong>
            <button
              title="Copiar token"
              onClick={() => navigator.clipboard.writeText(token)}
              className="ml-2 text-xs text-blue-600 hover:underline"
            >
              <ClipboardCheck className="inline w-4 h-4" />
            </button>
            <pre className="whitespace-pre-wrap">{token}</pre>
          </div>
        )}

        {response && (
          <div className="bg-muted border border-border p-4 rounded mt-4 text-sm space-y-1">
            <p><strong>Email:</strong> {response.email}</p>
            <p><strong>Nome:</strong> {response.nome}</p>
            {response.imagem && (
              <img src={response.imagem} alt="avatar" className="h-10 w-10 rounded-full mt-2" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
