// frontend/components/AIAssistant.tsx
import { useState } from "react";
import { useAI } from "../context/aiContext";

export const AIAssistant = () => {
  const { ask, response, loading } = useAI();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await ask(prompt);
    setPrompt("");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      <div className="mt-4 p-2 border rounded-lg min-h-20">
        {loading ? "AI is thinking..." : response}
      </div>
    </div>
  );
};
