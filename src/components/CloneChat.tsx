"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import {
  Send,
  Trash2,
  Bot,
  User,
  AlertTriangle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEPARTMENTS = [
  { id: "salao", label: "Salao" },
  { id: "cozinha", label: "Cozinha" },
  { id: "atendimento", label: "Atendimento" },
  { id: "higiene", label: "Higiene" },
  { id: "rh", label: "RH" },
  { id: "marketing", label: "Marketing" },
] as const;

type Department = (typeof DEPARTMENTS)[number]["id"];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: "up" | "down";
}

interface CloneChatProps {
  initialDepartment?: Department;
  onClose?: () => void;
}

export default function CloneChat({ initialDepartment, onClose }: CloneChatProps) {
  const [department, setDepartment] = useState<Department>(initialDepartment ?? "salao");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleDepartmentChange(dept: Department) {
    setDepartment(dept);
    setMessages([]);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          department,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) {
          setError("treinamento");
        } else {
          setError(data.error || "Erro ao comunicar com o clone");
        }
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Stream nao disponivel");
        return;
      }

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
          );
        }
      }
    } catch {
      setError("Erro de conexao");
    } finally {
      setLoading(false);
    }
  }

  const isTrainingError = error === "treinamento";

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-card">
      {/* Sidebar departamentos */}
      <div className="w-44 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold">Departamento</h3>
        </div>
        <div className="flex-1 overflow-auto">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => handleDepartmentChange(dept.id)}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                department === dept.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-accent text-muted-foreground"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              {dept.label}
            </button>
          ))}
        </div>
        {onClose && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>

      {/* Area de chat */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              Clone {DEPARTMENTS.find((d) => d.id === department)?.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessages([])}
            disabled={messages.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="w-10 h-10 mb-2" />
              <p className="text-sm">
                Pergunte sobre o departamento {DEPARTMENTS.find((d) => d.id === department)?.label}
              </p>
              <p className="text-xs mt-1">Respostas baseadas nos SOPs da sua marca</p>
            </div>
          )}

          {isTrainingError && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Clone em treinamento. A chave da API nao esta configurada.
            </div>
          )}

          {error && !isTrainingError && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="bg-primary/10 rounded-full p-1.5 h-fit mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className="max-w-[80%]">
                <div
                  className={`rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "assistant" && msg.content && (
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m) => (m.id === msg.id ? { ...m, feedback: "up" } : m))
                        )
                      }
                      className={`p-1 rounded hover:bg-muted ${msg.feedback === "up" ? "text-green-600" : "text-muted-foreground"}`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        setMessages((prev) =>
                          prev.map((m) => (m.id === msg.id ? { ...m, feedback: "down" } : m))
                        )
                      }
                      className={`p-1 rounded hover:bg-muted ${msg.feedback === "down" ? "text-red-600" : "text-muted-foreground"}`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="bg-muted rounded-full p-1.5 h-fit mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-center text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Pensando...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva sua pergunta..."
            disabled={loading || isTrainingError}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={loading || !input.trim() || isTrainingError}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
