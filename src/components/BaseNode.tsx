import React from 'react';
import { Handle, Position } from 'reactflow';
import { LucideIcon, Trash2, Copy } from 'lucide-react';

interface BaseNodeProps {
  id: string;
  selected?: boolean;
  title: string;
  icon: LucideIcon;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'teal' | 'fuchsia' | 'pink';
  inputs?: Array<{
    id: string;
    label?: string;
    position?: Position;
    className?: string;
  }>;
  outputs?: Array<{
    id: string;
    label?: string;
    position?: Position;
    className?: string;
  }>;
  onDelete?: () => void;
  onCopy?: () => void;
  children?: React.ReactNode;
  width?: string | number;
  height?: string | number;
}

export default function BaseNode({
  id,
  selected = false,
  title,
  icon: Icon,
  colorScheme = 'indigo',
  inputs = [],
  outputs = [],
  onDelete,
  onCopy,
  children,
  width,
  height,
}: BaseNodeProps) {
  // Color configuration
  const themes = {
    indigo: {
      border: 'border-slate-200 hover:border-indigo-400',
      headerBg: 'bg-indigo-50/40 border-indigo-100/60 text-indigo-950',
      iconBg: 'bg-indigo-50 text-indigo-600',
      dot: 'bg-indigo-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-indigo-500 ring-1 ring-indigo-500/50',
    },
    emerald: {
      border: 'border-slate-200 hover:border-emerald-400',
      headerBg: 'bg-emerald-50/40 border-emerald-100/60 text-emerald-950',
      iconBg: 'bg-emerald-50 text-emerald-600',
      dot: 'bg-emerald-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-emerald-500 ring-1 ring-emerald-500/50',
    },
    amber: {
      border: 'border-slate-200 hover:border-amber-400',
      headerBg: 'bg-amber-50/40 border-amber-100/60 text-amber-950',
      iconBg: 'bg-amber-50 text-amber-600',
      dot: 'bg-amber-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-amber-500 ring-1 ring-amber-500/50',
    },
    rose: {
      border: 'border-slate-200 hover:border-rose-400',
      headerBg: 'bg-rose-50/40 border-rose-100/60 text-rose-950',
      iconBg: 'bg-rose-50 text-rose-600',
      dot: 'bg-rose-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-rose-500 ring-1 ring-rose-500/50',
    },
    sky: {
      border: 'border-slate-200 hover:border-sky-400',
      headerBg: 'bg-sky-50/40 border-sky-100/60 text-sky-950',
      iconBg: 'bg-sky-50 text-sky-600',
      dot: 'bg-sky-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-sky-500 ring-1 ring-sky-500/50',
    },
    violet: {
      border: 'border-slate-200 hover:border-violet-400',
      headerBg: 'bg-violet-50/40 border-violet-100/60 text-violet-950',
      iconBg: 'bg-violet-50 text-violet-600',
      dot: 'bg-violet-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-violet-500 ring-1 ring-violet-500/50',
    },
    teal: {
      border: 'border-slate-200 hover:border-teal-400',
      headerBg: 'bg-teal-50/40 border-teal-100/60 text-teal-950',
      iconBg: 'bg-teal-50 text-teal-600',
      dot: 'bg-teal-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-teal-500 ring-1 ring-teal-500/50',
    },
    fuchsia: {
      border: 'border-slate-200 hover:border-fuchsia-400',
      headerBg: 'bg-fuchsia-50/40 border-fuchsia-100/60 text-fuchsia-950',
      iconBg: 'bg-fuchsia-50 text-fuchsia-600',
      dot: 'bg-fuchsia-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-fuchsia-500 ring-1 ring-fuchsia-500/50',
    },
    pink: {
      border: 'border-slate-200 hover:border-pink-400',
      headerBg: 'bg-pink-50/40 border-pink-100/60 text-pink-950',
      iconBg: 'bg-pink-50 text-pink-600',
      dot: 'bg-pink-500',
      glow: 'shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-pink-500 ring-1 ring-pink-500/50',
    },
  };

  const currentTheme = themes[colorScheme];

  return (
    <div
      id={id}
      className={`bg-white border text-slate-800 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-200 relative group select-none ${
        selected ? currentTheme.glow : currentTheme.border
      }`}
      style={{
        width: width || '240px',
        height: height || 'auto',
      }}
    >
      {/* Target (Input) Handles */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center space-y-4 pointer-events-none -translate-x-[6px] z-10">
        {inputs.map((input, idx) => (
          <div key={input.id} className="relative flex items-center pointer-events-auto">
            <Handle
              type="target"
              position={input.position || Position.Left}
              id={input.id}
              className={`w-3 h-3 border-2 border-white rounded-full hover:scale-125 hover:border-indigo-400 transition-all shadow-sm ${
                input.className || currentTheme.dot
              }`}
              style={{ top: 'auto', position: 'relative' }}
            />
            {input.label && (
              <span className="absolute left-4 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono font-medium text-slate-200 pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md">
                {input.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Header Bar */}
      <div className={`px-3.5 py-2.5 border-b flex items-center justify-between rounded-t-xl ${currentTheme.headerBg}`}>
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${currentTheme.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold font-sans tracking-wide truncate text-slate-900">
            {title}
          </span>
        </div>

        {/* Node Actions inside header */}
        <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              title="Duplicate Node"
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete Node"
              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Node Content Slot */}
      {children && (
        <div className="p-3.5 space-y-3 text-xs font-sans leading-relaxed">
          {children}
        </div>
      )}

      {/* Source (Output) Handles */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center space-y-4 pointer-events-none translate-x-[6px] z-10">
        {outputs.map((output, idx) => (
          <div key={output.id} className="relative flex items-center justify-end pointer-events-auto">
            {output.label && (
              <span className="absolute right-4 px-1.5 py-0.5 rounded bg-slate-900 text-[9px] font-mono font-medium text-slate-200 pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-md">
                {output.label}
              </span>
            )}
            <Handle
              type="source"
              position={output.position || Position.Right}
              id={output.id}
              className={`w-3 h-3 border-2 border-white rounded-full hover:scale-125 hover:border-indigo-400 transition-all shadow-sm ${
                output.className || currentTheme.dot
              }`}
              style={{ top: 'auto', position: 'relative' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
