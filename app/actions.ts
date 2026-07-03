"use server";

import { AiService, ChatResponse, ChatHistoryMessage } from '@/services/ai/aiService';
import { promises as fs } from 'fs';
import path from 'path';

async function logChatLocally(data: {
  timestamp: string;
  userMessage: string;
  history: ChatHistoryMessage[];
  isThinkingEnabled: boolean;
  selectedModel: 'gemini' | 'openrouter';
  files?: Array<{ name: string; type: string; sizeBytes: number }>;
  response: ChatResponse;
  forcedFeatures?: {
    browserSearch?: boolean;
    coding?: boolean;
    deepResearch?: boolean;
  };
}) {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    // Ensure logs directory exists
    await fs.mkdir(logsDir, { recursive: true });

    // Format log filename based on timestamp to avoid name collisions
    const safeTimestamp = data.timestamp.replace(/[:.]/g, '-');
    const logFilename = `chat_${safeTimestamp}.json`;
    const logPath = path.join(logsDir, logFilename);

    await fs.writeFile(logPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local chat log:', err);
  }
}

/**
 * Server action to process chat queries using the AiService agent orchestrator.
 */
export async function handleChatRequest(
  userMessage: string,
  history: ChatHistoryMessage[],
  isThinkingEnabled: boolean,
  selectedModel: 'gemini' | 'openrouter',
  files?: Array<{ name: string; type: string; base64?: string }>,
  forcedFeatures?: {
    browserSearch?: boolean;
    coding?: boolean;
    deepResearch?: boolean;
  }
): Promise<ChatResponse> {
  const timestamp = new Date().toISOString();
  const filesSummary = files?.map(f => ({
    name: f.name,
    type: f.type,
    sizeBytes: f.base64 ? Math.round((f.base64.length * 3) / 4) : 0
  }));

  try {
    const aiService = new AiService();
    const result = await aiService.generateText(userMessage, history, isThinkingEnabled, selectedModel, files, forcedFeatures);

    // Log the request and response locally
    // Note: Not awaiting to avoid adding delay to the response return
    logChatLocally({
      timestamp,
      userMessage,
      history,
      isThinkingEnabled,
      selectedModel,
      files: filesSummary,
      response: result,
      forcedFeatures
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Server Action Chat Request Error:', errorMessage);
    const errorResult: ChatResponse = {
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

    logChatLocally({
      timestamp,
      userMessage,
      history,
      isThinkingEnabled,
      selectedModel,
      files: filesSummary,
      response: errorResult
    });

    return errorResult;
  }
}
