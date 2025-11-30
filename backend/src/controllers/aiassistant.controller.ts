import { Request, Response } from "express";
import { OpenRouter } from "@dukebot/open-router";

const openRouter = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

export const askAI = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    const response = await openRouter.service.completeChat({
      prompt,
      system: "You are a helpful and creative assistant.",
      model: "tngtech/tng-r1t-chimera:free",
      max_tokens: 500 // safe limit, Chimera supports long context
    });

    res.json({ content: response.content });
  } catch (err: any) {
    console.error("AI error:", err);
    res.status(500).json({ error: err.message });
  }
};
