import React from 'react';
import { Position } from 'reactflow';
import { LogOut } from 'lucide-react';
import BaseNode from '../BaseNode';

interface OutputNodeProps {
  id: string;
  data: {
    label?: string;
    outputFormat?: string;
    updateNodeData?: (id: string, data: any) => void;
  };
  selected?: boolean;
}

export default function OutputNode({ id, data, selected }: OutputNodeProps) {
  const label = data.label || `output_${id.slice(-4)}`;
  const outputFormat = data.outputFormat || 'Plain Text';

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    data.updateNodeData?.(id, { label: e.target.value });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    data.updateNodeData?.(id, { outputFormat: e.target.value });
  };

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Output Response"
      icon={LogOut}
      colorScheme="rose"
      inputs={[{ id: 'value', label: 'value' }]}
    >
      <div className="space-y-2.5 text-xs text-slate-700">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Output Name
          </label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500/80 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Response Format
          </label>
          <select
            value={outputFormat}
            onChange={handleFormatChange}
            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500/30 focus:border-rose-500/80 cursor-pointer transition-all"
          >
            <option>Plain Text</option>
            <option>JSON Object</option>
            <option>Audio Stream</option>
            <option>Download File</option>
          </select>
        </div>
      </div>
    </BaseNode>
  );
}
