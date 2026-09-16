import React, { useEffect, useState } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useAiAssistant } from '../hooks/useAi';
import { useCurrentLanguage } from '@/hooks/useCurrentLanguage';
import { translate } from '@/lib/i18n';

export interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ isOpen, onClose, initialPrompt }) => {
  const language = useCurrentLanguage();
  const samplePrompts = [
    translate(language, 'assistant.panel.prompt.one'),
    translate(language, 'assistant.panel.prompt.two'),
    translate(language, 'assistant.panel.prompt.three'),
    translate(language, 'assistant.panel.prompt.four'),
  ];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: translate(language, 'assistant.panel.welcome'),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const assistantMutation = useAiAssistant();

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setInputMsg(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  if (!isOpen) return null;

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
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || translate(language, 'assistant.panel.unavailable');
        setErrorMessage(msg);
      },
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col overflow-hidden border-l border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] animate-in slide-in-from-right duration-200 sm:w-[460px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(79,70,229,0.16),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(245,158,11,0.14),transparent_28%),linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_42%,#F8FAFC_100%)]" />

      {/* Header */}
      <div className="relative border-b border-white/70 bg-white/72 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 text-white shadow-lg shadow-indigo-500/25">
            <Bot className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-950 shadow-sm">
              <Sparkles className="h-3 w-3 fill-slate-950" />
            </span>
          </div>
          <div>
            <h3 className="font-heading text-lg font-black tracking-tight text-slate-950">
              {translate(language, 'assistant.title')}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {translate(language, 'assistant.panel.subtitle')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-2xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900"
        >
            <X className="h-5 w-5" />
        </button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-extrabold text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Context-aware
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="relative flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
        {messages.map((m) => (
          <div
            key={m.id}
              className={`flex max-w-[92%] gap-3 ${
              m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold shadow-sm ${
                m.sender === 'user'
                    ? 'bg-slate-950 text-white'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/20'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex flex-col gap-1">
              <div
                  className={`rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  m.sender === 'user'
                      ? 'rounded-tr-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
                      : 'rounded-tl-md border border-slate-200/80 bg-white/92 text-slate-800'
                }`}
              >
                {m.text}
              </div>
                <span className={`px-1 text-[10px] font-bold text-slate-400 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.timestamp}
                </span>
            </div>
          </div>
        ))}

        {assistantMutation.isPending && (
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-indigo-100 bg-white/90 px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>{translate(language, 'assistant.panel.thinking')}</span>
          </div>
        )}
        </div>
      </div>

      {/* Quick Sample Prompts */}
      {showSuggestions && (
        <div className="relative border-t border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-xl">
          <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {translate(language, 'assistant.panel.suggestions')}
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={assistantMutation.isPending}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-[11px] font-bold text-slate-600 transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="relative border-t border-slate-200/80 bg-white px-4 py-4">
        {errorMessage && (
          <div className="mb-3 flex items-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 p-2.5 text-[11px] font-semibold text-rose-700">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2 shadow-[0_12px_34px_rgba(15,23,42,0.08)] transition-all focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-100"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={translate(language, 'assistant.panel.placeholder')}
            disabled={assistantMutation.isPending}
            className="h-10 flex-1 bg-transparent px-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={assistantMutation.isPending || !inputMsg.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/35 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
