declare module "@dukebot/open-router" {
  export interface CompleteChatOptions {
    prompt: string;
    system?: string;
    model?: string;
    max_tokens?: number; // optional, recommended for free models like TNG-R1T-Chimera
    temperature?: number; // optional
  }

  export interface CompleteChatResponse {
    content: string;
  }

  export class OpenRouter {
    constructor(options: { apiKey: string });
    service: {
      completeChat: (options: CompleteChatOptions) => Promise<CompleteChatResponse>;
    };
  }
}
