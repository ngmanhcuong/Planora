import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AssistantAnswerProps {
  text: string;
  compact?: boolean;
}

const renderInline = (text: string) => text.replace(/`/g, '')
  .split(/(\*\*[^*]+\*\*)/g)
  .filter(Boolean)
  .map((part, index) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={index} className="font-extrabold text-slate-950 dark:text-slate-100">{part.slice(2, -2)}</strong>
    : <React.Fragment key={index}>{part}</React.Fragment>);

export const AssistantAnswer: React.FC<AssistantAnswerProps> = ({ text, compact = false }) => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {lines.map((line, index) => {
        const heading = line.match(/^#{1,3}\s+(.+)$/) || line.match(/^\*\*([^*]+)\*\*:?$/);
        if (heading) {
          return (
            <h4 key={index} className="pt-1 text-[13px] font-black tracking-tight text-indigo-700 first:pt-0 dark:text-indigo-300">
              {heading[1]}
            </h4>
          );
        }

        const listItem = line.match(/^[-•]\s+(.+)$/);
        const numberedItem = line.match(/^(\d+)[.)]\s+(.+)$/);
        if (listItem || numberedItem) {
          const content = listItem?.[1] || numberedItem?.[2] || '';
          return (
            <div key={index} className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
              {numberedItem ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-indigo-600 px-1 text-[10px] font-black text-white">
                  {numberedItem[1]}
                </span>
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              )}
              <p className="min-w-0 text-[13px] font-medium leading-5 text-slate-700 dark:text-slate-200">{renderInline(content)}</p>
            </div>
          );
        }

        return <p key={index} className="text-[13px] font-medium leading-5 text-slate-700 dark:text-slate-200">{renderInline(line)}</p>;
      })}
    </div>
  );
};
