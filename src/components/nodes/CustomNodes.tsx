import React from 'react';
import { Position } from 'reactflow';
import { 
  Globe, 
  Database, 
  Filter, 
  Sparkles, 
  Terminal 
} from 'lucide-react';
import BaseNode from '../BaseNode';

// ==========================================
// 1. API INTEGRATION NODE
// ==========================================
export function APINode({ id, data, selected }: any) {
  const method = data.method || 'GET';
  const url = data.url || 'https://api.example.com/v1/data';

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="API Connector"
      icon={Globe}
      colorScheme="violet"
      inputs={[
        { id: 'trigger', label: 'Trigger' },
        { id: 'headers', label: 'Headers / Body' }
      ]}
      outputs={[
        { id: 'response', label: 'Response' },
        { id: 'status', label: 'HTTP Status' }
      ]}
    >
      <div className="space-y-2 text-xs text-slate-700">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="col-span-1">
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => data.updateNodeData?.(id, { method: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/80 cursor-pointer transition-all"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>DELETE</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Endpoint URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => data.updateNodeData?.(id, { url: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-500/30 focus:border-violet-500/80 transition-all"
            />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}

// ==========================================
// 2. DATABASE QUERY NODE
// ==========================================
export function DBNode({ id, data, selected }: any) {
  const engine = data.engine || 'PostgreSQL';
  const query = data.query || 'SELECT * FROM users LIMIT 10;';

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Database Query"
      icon={Database}
      colorScheme="amber"
      inputs={[
        { id: 'db_conn', label: 'DB Config' },
        { id: 'params', label: 'Query Params' }
      ]}
      outputs={[{ id: 'rows', label: 'Result Rows' }]}
    >
      <div className="space-y-2 text-xs text-slate-700">
        <div>
          <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            Database Engine
          </label>
          <select
            value={engine}
            onChange={(e) => data.updateNodeData?.(id, { engine: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/80 cursor-pointer transition-all"
          >
            <option>PostgreSQL</option>
            <option>MongoDB</option>
            <option>Redis Cache</option>
            <option>MySQL</option>
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            SQL / Query Script
          </label>
          <textarea
            value={query}
            onChange={(e) => data.updateNodeData?.(id, { query: e.target.value })}
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500/30 focus:border-amber-500/80 resize-none transition-all"
          />
        </div>
      </div>
    </BaseNode>
  );
}

// ==========================================
// 3. CONDITIONAL FILTER NODE
// ==========================================
export function FilterNode({ id, data, selected }: any) {
  const operator = data.operator || '==';
  const criteriaValue = data.criteriaValue || 'active';

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Conditional Filter"
      icon={Filter}
      colorScheme="teal"
      inputs={[{ id: 'data', label: 'Data In' }]}
      outputs={[
        { id: 'true_out', label: 'True Branch' },
        { id: 'false_out', label: 'False Branch' }
      ]}
    >
      <div className="space-y-2 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Operator
            </label>
            <select
              value={operator}
              onChange={(e) => data.updateNodeData?.(id, { operator: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500/80 cursor-pointer transition-all"
            >
              <option>==</option>
              <option>!=</option>
              <option>&gt;</option>
              <option>&lt;</option>
              <option>contains</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Check Value
            </label>
            <input
              type="text"
              value={criteriaValue}
              onChange={(e) => data.updateNodeData?.(id, { criteriaValue: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500/30 focus:border-teal-500/80 transition-all"
            />
          </div>
        </div>
      </div>
    </BaseNode>
  );
}

// ==========================================
// 4. PROMPT TEMPLATE NODE
// ==========================================
export function PromptNode({ id, data, selected }: any) {
  const templateType = data.templateType || 'Mustache';
  const schema = data.schema || 'JSON';

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Prompt Template"
      icon={Sparkles}
      colorScheme="pink"
      inputs={[
        { id: 'template', label: 'Template string' },
        { id: 'context', label: 'Context variables' }
      ]}
      outputs={[{ id: 'rendered', label: 'Rendered Prompt' }]}
    >
      <div className="space-y-2 text-xs text-slate-700">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Engine
            </label>
            <select
              value={templateType}
              onChange={(e) => data.updateNodeData?.(id, { templateType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500/30 focus:border-pink-500/80 cursor-pointer transition-all"
            >
              <option>Mustache</option>
              <option>Jinja2</option>
              <option>Liquid</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
              Variables Type
            </label>
            <select
              value={schema}
              onChange={(e) => data.updateNodeData?.(id, { schema: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500/30 focus:border-pink-500/80 cursor-pointer transition-all"
            >
              <option>JSON Schema</option>
              <option>Key-Value Pair</option>
              <option>CSV Format</option>
            </select>
          </div>
        </div>
      </div>
    </BaseNode>
  );
}

// ==========================================
// 5. JS SCRIPT CODE NODE
// ==========================================
export function CodeNode({ id, data, selected }: any) {
  const code = data.code || '// JS Execution code...\nreturn input_data * 2;';

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="JS Code Script"
      icon={Terminal}
      colorScheme="fuchsia"
      inputs={[{ id: 'input_data', label: 'input_data' }]}
      outputs={[{ id: 'result', label: 'result' }]}
    >
      <div className="space-y-2 text-xs text-slate-700">
        <div>
          <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
            JavaScript Execution (Sandbox)
          </label>
          <textarea
            value={code}
            onChange={(e) => data.updateNodeData?.(id, { code: e.target.value })}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-mono text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30 focus:border-fuchsia-500/80 resize-none transition-all"
          />
        </div>
      </div>
    </BaseNode>
  );
}
