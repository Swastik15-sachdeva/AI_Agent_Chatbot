"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ClaudeChatInput, { AttachedFile } from '@/components/ui/claude-style-chat-input';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { handleChatRequest } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  steps?: any[];
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Chat sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Auth Redirect Guard
  useEffect(() => {
    // Give auth state a moment to load from localStorage/Supabase
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/auth');
      } else {
        setAuthChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Load chat sessions from localStorage on mount (resilient fallback)
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const saved = localStorage.getItem('agent_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        } else {
          // If empty, create initial session
          const initialId = Math.random().toString(36).substring(2, 9);
          const initialSession: ChatSession = {
            id: initialId,
            title: 'New Conversation',
            messages: []
          };
          setSessions([initialSession]);
          setActiveSessionId(initialId);
        }
      } else {
        const initialId = Math.random().toString(36).substring(2, 9);
        const initialSession: ChatSession = {
          id: initialId,
          title: 'New Conversation',
          messages: []
        };
        setSessions([initialSession]);
        setActiveSessionId(initialId);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  }, [isAuthenticated]);

  // Save sessions to localStorage when they change
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem('agent_chat_sessions', JSON.stringify(updatedSessions));
  };

  const handleCreateSession = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newSession: ChatSession = {
      id: newId,
      title: 'New Conversation',
      messages: []
    };
    saveSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleSendMessage = async (data: {
    message: string;
    files: AttachedFile[];
    pastedContent: any[];
    isThinkingEnabled: boolean;
  }) => {
    if (!activeSessionId) return;

    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    // Create the user message object
    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: data.message
    };

    const updatedMessages = [...currentSession.messages, userMsg];
    
    // Update session list locally with user message
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // If it was named "New Conversation", rename it to the user's prompt snippet
        const title = s.title === 'New Conversation'
          ? data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message
          : s.title;

        return { ...s, title, messages: updatedMessages };
      }
      return s;
    });

    saveSessions(updatedSessions);
    setIsLoading(true);

    try {
      // Send history and current message to server action
      const response = await handleChatRequest(
        data.message,
        currentSession.messages, // pass current history
        data.isThinkingEnabled
      );

      // Create assistant response message object
      const assistantMsgId = Math.random().toString(36).substring(2, 9);
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: response.response,
        steps: response.steps
      };

      const finalMessages = [...updatedMessages, assistantMsg];

      // Update sessions list with assistant response
      const finalSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          // Keep title or set from first prompt if needed
          const title = s.title === 'New Conversation'
            ? data.message.length > 30 ? data.message.substring(0, 30) + '...' : data.message
            : s.title;
          return { ...s, title, messages: finalMessages };
        }
        return s;
      });

      saveSessions(finalSessions);
    } catch (err: any) {
      console.error('Failed to get chat response:', err);
      // Append error message to chat window
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: `Error: Failed to process request. Details: ${err.message}`
      };
      
      const finalSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...updatedMessages, errorMsg] };
        }
        return s;
      });
      saveSessions(finalSessions);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Render authentic loading screen during auth routing check
  if (authChecking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
        <p className="text-zinc-400 text-sm font-medium">Checking authorization session...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
      />

      {/* Main Chat Area Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Messages Stream */}
        <ChatWindow
          messages={activeSession ? activeSession.messages : []}
          isLoading={isLoading}
        />

        {/* Floating Bottom Input Control Bar */}
        <div className="w-full bg-linear-to-t from-zinc-50 dark:from-zinc-900 via-zinc-50/90 dark:via-zinc-900/90 to-transparent p-4 md:p-6 shrink-0 relative z-20">
          <ClaudeChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
