import React, { useEffect, useState, useRef } from 'react';
import { X, Send, Bot, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAiAssistant } from '../hooks/useAi';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';
import { AssistantAnswer } from './AssistantAnswer';
import { useAuthStore } from '@/stores/useAuthStore';

export interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onResponse?: (answer: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ isOpen, onClose, initialPrompt, onResponse }) => {
  const language = useCurrentLanguage();
  const user = useAuthStore((state) => state.user);
  const [brokenAvatar, setBrokenAvatar] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userInitials = (user?.name || 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const samplePrompts = [
    translate(language, 'assistant.panel.prompt.one'),
    translate(language, 'assistant.panel.prompt.two'),
    translate(language, 'assistant.panel.prompt.three'),
    translate(language, 'assistant.panel.prompt.four'),
  ];

  const initialWelcomeMsg: ChatMessage = {
    id: 'msg_welcome',
    sender: 'assistant',
    text: translate(language, 'assistant.panel.welcome'),
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMsg]);
  const [inputMsg, setInputMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const assistantMutation = useAiAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInputMsg(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    setBrokenAvatar(null);
  }, [user?.avatarUrl]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages([
      {
        ...initialWelcomeMsg,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setShowSuggestions(true);
    setErrorMessage('');
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    if (text.length > 2000) {
      setErrorMessage(translate(language, 'assistant.panel.tooLong'));
      return;
    }

    setErrorMessage('');
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setShowSuggestions(false);

    assistantMutation.mutate(text, {
      onSuccess: (data) => {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'assistant',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        onResponse?.(data.answer);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || translate(language, 'assistant.panel.unavailable');
        setErrorMessage(msg);
      },
    });
  };

  return (
    <div className="fixed bottom-24 right-6 sm:bottom-24 sm:right-6 z-50 flex flex-col w-[calc(100vw-3rem)] sm:w-[360px] md:w-[380px] h-[490px] max-h-[75vh] rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl shadow-indigo-950/25 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 dark:border-slate-800 dark:bg-slate-900/95">
      {/* 1. Header: Gradient Header bar like 3Do / modern bot widgets */}
      <div className="relative flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 px-4 py-3.5 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md border border-white/25 shadow-xs">
            <Bot className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-indigo-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading text-sm font-extrabold tracking-tight text-white leading-tight">
                {translate(language, 'assistant.title')}
              </h3>
              <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-white/15 text-[9px] font-bold text-white/95 border border-white/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-white/80 font-medium truncate max-w-[200px]">
              {translate(language, 'assistant.panel.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetChat}
            title="Làm mới đoạn hội thoại"
            aria-label="Làm mới đoạn hội thoại"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trợ lý"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Messages Chat Body */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-3.5 calendar-soft-scrollbar bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex max-w-[88%] gap-2.5 ${
              m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold shadow-xs mt-0.5 ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700'
              }`}
            >
              {m.sender === 'user' ? (
                user?.avatarUrl && brokenAvatar !== user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'Avatar'}
                    className="h-full w-full object-cover"
                    onError={() => setBrokenAvatar(user.avatarUrl || null)}
                  />
                ) : (
                  <span>{userInitials}</span>
                )
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div className="flex flex-col gap-1 max-w-[calc(100%-2.2rem)]">
              <div
                className={`rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs font-normal ${
                  m.sender === 'user'
                    ? 'rounded-tr-xs bg-indigo-600 text-white font-medium'
                    : 'rounded-tl-xs border border-slate-200/90 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-800/90 dark:text-slate-100'
                }`}
              >
                {m.sender === 'assistant' ? <AssistantAnswer text={m.text} compact /> : m.text}
              </div>
              <span
                className={`px-1 text-[10px] font-semibold text-slate-400 ${
                  m.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {assistantMutation.isPending && (
          <div className="flex w-fit items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>{translate(language, 'assistant.panel.thinking')}</span>
          </div>
        )}

        {/* Inlined Question Suggestions Inside Chat Stream (Clean pill chips) */}
        {showSuggestions && (
          <div className="pt-2 pb-1 space-y-1.5 animate-in fade-in duration-200">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1">
              {translate(language, 'assistant.panel.suggestions')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={assistantMutation.isPending}
                  className="text-left px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:opacity-50"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area */}
      <div className="border-t border-slate-200/80 bg-white px-3.5 pt-3 pb-3 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        {errorMessage && (
          <div className="mb-2 flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 py-1 pl-4 pr-1.5 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-800/70 dark:focus-within:bg-slate-800 shadow-2xs"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={translate(language, 'assistant.panel.placeholder')}
            disabled={assistantMutation.isPending}
            className="h-9 flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={assistantMutation.isPending || !inputMsg.trim()}
            aria-label="Gửi tin nhắn"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Powered by Planora AI
          </span>
        </div>
      </div>
    </div>
  );
};
