import React, { useMemo } from 'react';
import { Position } from 'reactflow';
import { Type } from 'lucide-react';
import BaseNode from '../BaseNode';

interface TextNodeProps {
  id: string;
  data: {
    text?: string;
    updateNodeData?: (id: string, data: any) => void;
  };
  selected?: boolean;
}

export default function TextNode({ id, data, selected }: TextNodeProps) {
  const text = data.text || '';

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    data.updateNodeData?.(id, { text: e.target.value });
  };

  // 1. Dynamic Width and Height Calculation
  const dimensions = useMemo(() => {
    const lines = text.split('\n');
    const lineCount = lines.length;
    const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);

    // Dynamic width: scale based on longest line, bounded between 240px and 500px
    const computedWidth = Math.min(500, Math.max(240, longestLine * 8 + 48));
    
    // Dynamic height: scale based on number of lines, bounded between 160px and 400px
    const computedHeight = Math.min(400, Math.max(160, lineCount * 18 + 120));

    return {
      width: computedWidth,
      height: computedHeight
    };
  }, [text]);

  // 2. Variable Parsing & Dynamic Left-Side Handles Generation
  const variableHandles = useMemo(() => {
    // Regex matching {{ variable_name }}
    const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const matches = Array.from(text.matchAll(regex));
    // Filter to get unique variable names
    const uniqueVariables = Array.from(new Set(matches.map(m => m[1])));

    return uniqueVariables.map(varName => ({
      id: varName, // Variable name is the handle ID on the left
      label: varName,
      position: Position.Left,
    }));
  }, [text]);

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Dynamic Text Block"
      icon={Type}
      colorScheme="sky"
      inputs={variableHandles} // Dynamically created handles on the left side
      outputs={[{ id: 'output', label: 'text' }]}
      width={dimensions.width}
      height={dimensions.height}
    >
      <div className="flex flex-col h-full space-y-1.5 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Text / Prompts Body
          </label>
          {variableHandles.length > 0 && (
            <span className="text-[9px] font-mono bg-sky-50 text-sky-600 border border-sky-200/60 px-1.5 py-0.5 rounded">
              {variableHandles.length} variables detected
            </span>
          )}
        </div>
        
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Type here... Use {{ var_name }} to auto-generate target handles on the left!"
          className="w-full flex-1 bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/30 focus:border-sky-500/80 resize-none h-[calc(100%-25px)] transition-all"
        />
      </div>
    </BaseNode>
  );
}
