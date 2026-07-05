import React from 'react';
import { Position } from 'reactflow';
import { Cpu } from 'lucide-react';
import BaseNode from '../BaseNode';

interface LLMNodeProps {
  id: string;
  data: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    updateNodeData?: (id: string, data: any) => void;
  };
  selected?: boolean;
}

export default function LLMNode({ id, data, selected }: LLMNodeProps) {
  const model = data.model || 'gemini-2.5-flash';
  const temperature = typeof data.temperature === 'number' ? data.temperature : 0.7;
  const systemPrompt = data.systemPrompt || 'You are a helpful pipeline assistant...';

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { model: e.target.value });
  };

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.updateNodeData?.(id, { temperature: parseFloat(e.target.value) });
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.updateNodeData?.(id, { systemPrompt: e.target.value });
  };

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Language Model (LLM)"
      icon={Cpu}
      colorScheme="indigo"
      inputs={[
        { id: 'prompt', label: 'Prompt' },
        { id: 'context', label: 'System Context' },
      ]}
      outputs={[{ id: 'response', label: 'Response' }]}
    >
      <div className="space-y-2.5 text-xs text-slate-700">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Foundation Model
          </label>
          <select
            value={model}
            onChange={handleModelChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/80 cursor-pointer transition-all"
          >
            <option>gemini-2.5-flash</option>
            <option>gemini-2.5-pro</option>
            <option>gpt-4o-mini</option>
            <option>gpt-4o</option>
            <option>claude-3-5-sonnet</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            <span>Temperature</span>
            <span className="text-indigo-600 font-bold">{temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={temperature}
            onChange={handleTempChange}
            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            System Instructions
          </label>
          <textarea
            value={systemPrompt}
            onChange={handlePromptChange}
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/80 resize-none transition-all"
          />
        </div>
      </div>
    </BaseNode>
  );
}
