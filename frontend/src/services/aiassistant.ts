import api from "./api";

export interface AIResponse {
  content: string;
}

export const askAI = async (prompt: string): Promise<AIResponse> => {
  const res = await api.post(`/aiassistant/ask`, { prompt });
  return res.data;
};
