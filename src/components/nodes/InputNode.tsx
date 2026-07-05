import React from 'react';
import { Position } from 'reactflow';
import { LogIn } from 'lucide-react';
import BaseNode from '../BaseNode';

interface InputNodeProps {
  id: string;
  data: {
    label?: string;
    inputType?: string;
    updateNodeData?: (id: string, data: any) => void;
  };
  selected?: boolean;
}

export default function InputNode({ id, data, selected }: InputNodeProps) {
  const label = data.label || `input_${id.slice(-4)}`;
  const inputType = data.inputType || 'Text';

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.updateNodeData?.(id, { label: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { inputType: e.target.value });
  };

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Input Parameter"
      icon={LogIn}
      colorScheme="emerald"
      outputs={[{ id: 'output', label: 'value' }]}
    >
      <div className="space-y-2.5 text-xs text-slate-700">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Variable Name
          </label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/80 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Data Type
          </label>
          <select
            value={inputType}
            onChange={handleTypeChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500/80 cursor-pointer transition-all"
          >
            <option>Text</option>
            <option>Number</option>
            <option>File/Blob</option>
            <option>Boolean</option>
          </select>
        </div>
      </div>
    </BaseNode>
  );
}
