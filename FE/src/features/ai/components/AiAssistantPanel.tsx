import React, { useState } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useAiAssistant } from '../hooks/useAi';

export interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  'Hôm nay tôi nên ưu tiên làm gì trước?',
  'Tuần này tôi có deadline nào gấp?',
  'Lịch học hôm nay có bị trùng không?',
  'Tại sao điểm năng suất hôm nay thấp?',
];

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI Planora. Tôi có thể hỗ trợ bạn tư vấn thứ tự ưu tiên công việc, giải đáp lịch học và nhắc nhở hạn chót hôm nay.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const assistantMutation = useAiAssistant();

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    if (text.length > 2000) {
      setErrorMessage('Nội dung câu hỏi quá dài (tối đa 2000 ký tự).');
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
        const msg = err.response?.data?.message || 'Tính năng AI hiện không khả dụng. Vui lòng thử lại sau.';
        setErrorMessage(msg);
      },
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white border-l border-[#E2E8F0] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-gradient-to-r from-[#EEF2FF] to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#131B2E] font-heading flex items-center gap-1.5">
              Trợ lý AI Planora
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </h3>
            <p className="text-[11px] text-[#64748B]">Tư vấn năng suất & lịch học cá nhân</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#131B2E] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#F8FAFC]/50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 max-w-[85%] ${
              m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-[#131B2E] text-white'
                  : 'bg-[#4F46E5] text-white shadow-2xs'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#4F46E5] text-white rounded-tr-none'
                    : 'bg-white border border-[#E2E8F0] text-[#131B2E] rounded-tl-none shadow-2xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-[#94A3B8] px-1 font-mono">{m.timestamp}</span>
            </div>
          </div>
        ))}

        {assistantMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-[#64748B] p-2 bg-white rounded-xl border border-[#E2E8F0] w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-[#4F46E5]" />
            <span>Planora Assistant đang suy nghĩ...</span>
          </div>
        )}
      </div>

      {/* Quick Sample Prompts */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white flex flex-col gap-2">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Gợi ý câu hỏi</span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={assistantMutation.isPending}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#F1F5F9] hover:bg-[#EEF2FF] hover:text-[#4F46E5] text-[#475569] font-medium transition-colors text-left border border-[#E2E8F0]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-[#E2E8F0] bg-white flex flex-col gap-2">
        {errorMessage && (
          <div className="text-[11px] font-semibold text-[#BA1A1A] bg-[#FFF1F2] p-2 rounded-lg border border-[#FFE4E6] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Hỏi Trợ lý Planora..."
            disabled={assistantMutation.isPending}
            className="flex-1 h-9 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#131B2E] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={assistantMutation.isPending || !inputMsg.trim()}
            className="w-9 h-9 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
