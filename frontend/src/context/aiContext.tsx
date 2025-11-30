// frontend/context/AIContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { askAI, type AIResponse } from "../services/aiassistant";

interface AIContextType {
  ask: (prompt: string) => Promise<void>;
  response: string;
  loading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (prompt: string) => {
    setLoading(true);
    try {
      const res: AIResponse = await askAI(prompt);
      setResponse(res.content);
    } catch (err) {
      console.error("AI error:", err);
      setResponse("Error contacting AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ ask, response, loading }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) throw new Error("useAI must be used within AIProvider");
  return context;
};
