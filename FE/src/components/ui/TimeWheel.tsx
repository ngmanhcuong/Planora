import { useLayoutEffect, useRef } from 'react';

const ROW_HEIGHT = 36;

export function TimeWheel({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(0, options.indexOf(value));
  useLayoutEffect(() => {
    const element = ref.current;
    if (element && Math.round(element.scrollTop / ROW_HEIGHT) !== selectedIndex) {
      element.scrollTop = selectedIndex * ROW_HEIGHT;
    }
  }, [selectedIndex]);

  const choose = (index: number) => {
    const bounded = Math.max(0, Math.min(options.length - 1, index));
    if (ref.current) ref.current.scrollTop = bounded * ROW_HEIGHT;
    onChange(options[bounded]);
  };

  return <div ref={ref} role="listbox" aria-label={label} tabIndex={0}
    aria-activedescendant={`time-wheel-${label}-${value}`}
    onKeyDown={event => {
      const index = event.key === 'ArrowDown' ? selectedIndex + 1 : event.key === 'ArrowUp' ? selectedIndex - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : null;
      if (index !== null) { event.preventDefault(); choose(index); }
    }}
    onScroll={event => {
      const index = Math.max(0, Math.min(options.length - 1, Math.round(event.currentTarget.scrollTop / ROW_HEIGHT)));
      if (options[index] !== value) onChange(options[index]);
    }}
    className="h-[108px] snap-y snap-mandatory overflow-y-auto overscroll-contain touch-pan-y px-1 py-9 [scrollbar-width:thin]">
    {options.map((option, index) => <div key={option} id={`time-wheel-${label}-${option}`} role="option" aria-selected={option === value}
      onClick={() => choose(index)}
      className={`flex h-9 w-full shrink-0 snap-center cursor-pointer items-center justify-center rounded-xl text-xl font-black leading-none ${option === value ? 'text-[#4F46E5]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}>
      {option}
    </div>)}
  </div>;
}
