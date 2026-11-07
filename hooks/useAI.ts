import * as Crypto from 'expo-crypto';
import { useRef, useState } from 'react';

import i18n from '@/config/i18n';
import { AssistantUnavailableError, runModel, SafetyRejection, type ModelDriver, type ModelTurn } from '@/lib/ai/model-runner';
import { assessPrompt } from '@/lib/ai/safety';
import { estimateTokens } from '@/lib/ai/tokenizer';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

function message(role: ChatMessage['role'], text: string): ChatMessage {
  return { id: Crypto.randomUUID(), role, text };
}

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [driver, setDriver] = useState<ModelDriver>('cloud');
  const abortRef = useRef<AbortController | null>(null);

  const send = async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || pending) return;
    const user = message('user', trimmed);
    const verdict = assessPrompt(trimmed);
    if (!verdict.allowed || estimateTokens(trimmed) > 3000) {
      setMessages((current) => [...current, user, message('assistant', i18n.t('ai.blocked'))]);
      return;
    }

    const history: ModelTurn[] = [...messages, user]
      .filter((item) => item.text.trim())
      .slice(-12)
      .map((item) => ({ role: item.role, content: item.text }));
    const assistant = message('assistant', '');
    setMessages((current) => [...current, user, assistant]);
    setPending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const selected = await runModel(
        history,
        (token) => {
          setMessages((current) =>
            current.map((item) => (item.id === assistant.id ? { ...item, text: item.text + token } : item)),
          );
        },
        controller.signal,
      );
      setDriver(selected);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      const text =
        error instanceof SafetyRejection
          ? i18n.t('ai.blocked')
          : error instanceof AssistantUnavailableError && error.reason === 'preview'
            ? i18n.t('ai.preview')
            : i18n.t('ai.unavailable');
      setMessages((current) => current.map((item) => (item.id === assistant.id ? { ...item, text } : item)));
    } finally {
      setPending(false);
      abortRef.current = null;
    }
  };

  const stop = () => abortRef.current?.abort();

  const clear = () => {
    abortRef.current?.abort();
    setMessages([]);
  };

  return { messages, pending, driver, send, stop, clear };
}
