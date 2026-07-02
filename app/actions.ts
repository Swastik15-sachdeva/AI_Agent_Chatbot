"use server";

import { AiService, ChatResponse, ChatHistoryMessage } from '@/services/ai/aiService';

/**
 * Server action to process chat queries using the AiService agent orchestrator.
 */
export async function handleChatRequest(
  userMessage: string,
  history: ChatHistoryMessage[],
  isThinkingEnabled: boolean,
  selectedModel: 'gemini' | 'openrouter',
  files?: Array<{ name: string; type: string; base64?: string }>
): Promise<ChatResponse> {
  try {
    const aiService = new AiService();
    return await aiService.generateText(userMessage, history, isThinkingEnabled, selectedModel, files);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Server Action Chat Request Error:', errorMessage);
    return {
      success: false,
      response: `An error occurred on the server while processing your request: ${errorMessage}`,
      steps: [
        {
          type: 'error',
          title: 'Server Error',
          content: errorMessage
        }
      ]
    };
  }
}
