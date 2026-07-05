import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  ChevronRight, 
  Workflow,
  Cpu,
  LogIn,
  LogOut,
  Type,
  Globe,
  Database,
  Filter,
  Sparkles,
  Terminal,
  Bookmark
} from 'lucide-react';

// Import our custom node types
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import LLMNode from './nodes/LLMNode';
import TextNode from './nodes/TextNode';
import { APINode, DBNode, FilterNode, PromptNode, CodeNode } from './nodes/CustomNodes';

// Node type registry
const nodeTypes = {
  customInput: InputNode,
  customOutput: OutputNode,
  customLLM: LLMNode,
  customText: TextNode,
  customAPI: APINode,
  customDB: DBNode,
  customFilter: FilterNode,
  customPrompt: PromptNode,
  customCode: CodeNode,
};

// Node metadata for side bar creation
const NODE_CATALOG = [
  {
    type: 'customInput',
    title: 'Input Parameter',
    icon: LogIn,
    color: 'emerald',
    desc: 'Pass dynamic input arguments to your pipeline.',
    category: 'Core',
    defaultData: { label: 'user_query', inputType: 'Text' },
  },
  {
    type: 'customOutput',
    title: 'Output Response',
    icon: LogOut,
    color: 'rose',
    desc: 'Retrieve output results or end execution.',
    category: 'Core',
    defaultData: { label: 'final_answer', outputFormat: 'Plain Text' },
  },
  {
    type: 'customLLM',
    title: 'Language Model (LLM)',
    icon: Cpu,
    color: 'indigo',
    desc: 'Interact with powerful foundational models.',
    category: 'Core',
    defaultData: { model: 'gemini-2.5-flash', temperature: 0.7, systemPrompt: 'You are a helpful assistant.' },
  },
  {
    type: 'customText',
    title: 'Dynamic Text Block',
    icon: Type,
    color: 'sky',
    desc: 'Write template bodies. Uses {{ variable }} syntax to generate input handles dynamically.',
    category: 'Core',
    defaultData: { text: 'Hello {{ user_name }}, please summarize: {{ code_body }}' },
  },
  {
    type: 'customAPI',
    title: 'API Connector',
    icon: Globe,
    color: 'violet',
    desc: 'Call external JSON APIs via standard HTTP requests.',
    category: 'Integrations',
    defaultData: { method: 'GET', url: 'https://api.example.com/v1/metrics' },
  },
  {
    type: 'customDB',
    title: 'Database Query',
    icon: Database,
    color: 'amber',
    desc: 'Query, cache, or extract records from structured DB engines.',
    category: 'Integrations',
    defaultData: { engine: 'PostgreSQL', query: 'SELECT * FROM users LIMIT 10;' },
  },
  {
    type: 'customFilter',
    title: 'Conditional Filter',
    icon: Filter,
    color: 'teal',
    desc: 'Branch logic based on mathematical or string criteria.',
    category: 'Logic',
    defaultData: { operator: '==', criteriaValue: 'active' },
  },
  {
    type: 'customPrompt',
    title: 'Prompt Template',
    icon: Sparkles,
    color: 'pink',
    desc: 'Format text prompts using Mustache or Jinja.',
    category: 'Logic',
    defaultData: { templateType: 'Mustache', schema: 'JSON' },
  },
  {
    type: 'customCode',
    title: 'JS Code Script',
    icon: Terminal,
    color: 'fuchsia',
    desc: 'Execute custom sandboxed JavaScript snippets.',
    category: 'Logic',
    defaultData: { code: 'return input_data * 10;' },
  },
];

// Helper to seed a gorgeous default pipeline demonstrating variable handles and valid DAG structure
const initialNodes: Node[] = [
  {
    id: 'node-input-1',
    type: 'customInput',
    position: { x: 50, y: 150 },
    data: { label: 'developer_name', inputType: 'Text' },
  },
  {
    id: 'node-code-1',
    type: 'customCode',
    position: { x: 50, y: 350 },
    data: { code: 'const size = 128;\nreturn `export const CONFIG = { size: ${size} };`;' },
  },
  {
    id: 'node-text-1',
    type: 'customText',
    position: { x: 340, y: 180 },
    data: { text: 'Greetings, {{ developer_name }}!\n\nHere is your generated code template:\n{{ code_snippet }}\n\nPlease evaluate this setup.' },
  },
  {
    id: 'node-llm-1',
    type: 'customLLM',
    position: { x: 680, y: 120 },
    data: { model: 'gemini-2.5-flash', temperature: 0.8, systemPrompt: 'Analyze code templates for optimization opportunities.' },
  },
  {
    id: 'node-output-1',
    type: 'customOutput',
    position: { x: 980, y: 220 },
    data: { label: 'analysis_report', outputFormat: 'JSON Object' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'edge-input-to-var1',
    source: 'node-input-1',
    sourceHandle: 'output',
    target: 'node-text-1',
    targetHandle: 'developer_name',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
  },
  {
    id: 'edge-code-to-var2',
    source: 'node-code-1',
    sourceHandle: 'result',
    target: 'node-text-1',
    targetHandle: 'code_snippet',
    animated: true,
    style: { stroke: '#d946ef', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d946ef' },
  },
  {
    id: 'edge-text-to-llm',
    source: 'node-text-1',
    sourceHandle: 'output',
    target: 'node-llm-1',
    targetHandle: 'prompt',
    animated: true,
    style: { stroke: '#0ea5e9', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
  },
  {
    id: 'edge-llm-to-output',
    source: 'node-llm-1',
    sourceHandle: 'response',
    target: 'node-output-1',
    targetHandle: 'value',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
  },
];

export default function PipelineBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Modal alert state for DAG response
  const [reportData, setReportData] = useState<{
    open: boolean;
    loading: boolean;
    num_nodes: number;
    num_edges: number;
    is_dag: boolean;
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState<'All' | 'Core' | 'Integrations' | 'Logic'>('All');
  const [showHelp, setShowHelp] = useState(false);

  // Initial loader
  React.useEffect(() => {
    // Populate default flow automatically so users have an instantly functional playground
    handleLoadSample();
  }, []);

  // Sync state mutations to the correct node using ID
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Handles duplicate nodes
  const handleDuplicateNode = useCallback((node: Node) => {
    const newId = `node-${node.type?.replace('custom', '').toLowerCase()}-${Date.now()}`;
    const newNode: Node = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      selected: false,
      data: {
        ...node.data,
        updateNodeData, // must wire the callback to the new node
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, updateNodeData]);

  // Handles deleting individual node
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Inject helper data callbacks to nodes when loaded/updated
  const enrichNodes = useCallback((nds: Node[]) => {
    return nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        updateNodeData,
        onCopy: () => handleDuplicateNode(n),
        onDelete: () => handleDeleteNode(n.id),
      },
    }));
  }, [updateNodeData, handleDuplicateNode, handleDeleteNode]);

  // Load sample pipeline
  const handleLoadSample = () => {
    setNodes(enrichNodes(initialNodes));
    setEdges(initialEdges);
  };

  // Clear canvas completely
  const handleResetCanvas = () => {
    setNodes([]);
    setEdges([]);
  };

  // Adding nodes instantly via clicking the catalog list
  const handleAddNode = (catalogItem: typeof NODE_CATALOG[0]) => {
    const typeLabel = catalogItem.type.replace('custom', '').toLowerCase();
    const newId = `node-${typeLabel}-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: catalogItem.type,
      position: {
        x: 150 + Math.random() * 100,
        y: 150 + Math.random() * 100,
      },
      data: {
        ...catalogItem.defaultData,
      },
    };

    setNodes((nds) => enrichNodes([...nds, newNode]));
  };

  // Connecting nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Connect style depending on source node types
      let strokeColor = '#6366f1';
      if (params.source?.includes('input')) strokeColor = '#10b981';
      if (params.source?.includes('code')) strokeColor = '#d946ef';
      if (params.source?.includes('text')) strokeColor = '#0ea5e9';

      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        animated: true,
        style: { stroke: strokeColor, strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: strokeColor },
      } as Edge;

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Submit pipeline to Backend DAG Parse API
  const handleSubmitPipeline = async () => {
    setReportData({
      open: true,
      loading: true,
      num_nodes: nodes.length,
      num_edges: edges.length,
      is_dag: false,
    });

    try {
      // Send nodes and edges configuration
      const response = await fetch('/api/pipelines/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, type: n.type })),
          edges: edges.map(e => ({ source: e.source, target: e.target })),
        }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to parse the graph.');
      }

      const result = await response.json();
      
      setReportData({
        open: true,
        loading: false,
        num_nodes: result.num_nodes,
        num_edges: result.num_edges,
        is_dag: result.is_dag,
      });

    } catch (err: any) {
      console.error(err);
      setReportData({
        open: true,
        loading: false,
        num_nodes: nodes.length,
        num_edges: edges.length,
        is_dag: false,
      });
    }
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    if (activeCategory === 'All') return NODE_CATALOG;
    return NODE_CATALOG.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans">
      
      {/* Dynamic Header */}
      <header className="h-16 shrink-0 border-b border-slate-100 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100/50">
            <Workflow className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-sans tracking-tight text-slate-900">
              VectorShift
            </h1>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">
              Pipeline Designer
            </p>
          </div>
        </div>

        {/* Workspace controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer text-xs flex items-center space-x-1.5 font-medium shadow-sm"
            title="How to write Variables"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <button
            onClick={handleLoadSample}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition-all cursor-pointer text-xs flex items-center space-x-1.5 font-medium shadow-sm"
            title="Load Prebuilt Graph"
          >
            <RotateCcw className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            onClick={handleResetCanvas}
            className="p-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/50 text-rose-700 font-medium rounded-lg transition-all cursor-pointer text-xs shadow-sm"
            title="Clear canvas"
          >
            Clear All
          </button>

          <button
            onClick={handleSubmitPipeline}
            disabled={nodes.length === 0}
            className="py-2 px-4.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs rounded-lg shadow-sm shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center space-x-2 cursor-pointer border border-indigo-700/20"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Validate & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side Sidebar - Nodes Selector */}
        <aside className="w-80 shrink-0 border-r border-slate-100 bg-white flex flex-col z-10 overflow-hidden shadow-[1px_0_3px_rgba(0,0,0,0.01)]">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-3">
              Components Toolkit
            </h2>

            {/* Category selection */}
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 border border-slate-200/60 rounded-lg">
              {(['All', 'Core', 'Integrations', 'Logic'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List of nodes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar bg-slate-50/50">
            {filteredCatalog.map((item) => {
              const Icon = item.icon;
              // Border colors
              const colors: Record<string, string> = {
                emerald: 'hover:border-emerald-400 border-slate-200 hover:bg-white',
                rose: 'hover:border-rose-400 border-slate-200 hover:bg-white',
                indigo: 'hover:border-indigo-400 border-slate-200 hover:bg-white',
                sky: 'hover:border-sky-400 border-slate-200 hover:bg-white',
                violet: 'hover:border-violet-400 border-slate-200 hover:bg-white',
                amber: 'hover:border-amber-400 border-slate-200 hover:bg-white',
                teal: 'hover:border-teal-400 border-slate-200 hover:bg-white',
                pink: 'hover:border-pink-400 border-slate-200 hover:bg-white',
                fuchsia: 'hover:border-fuchsia-400 border-slate-200 hover:bg-white',
              };

              const badgeColors: Record<string, string> = {
                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/60',
                rose: 'bg-rose-50 text-rose-600 border-rose-100/60',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100/60',
                sky: 'bg-sky-50 text-sky-600 border-sky-100/60',
                violet: 'bg-violet-50 text-violet-600 border-violet-100/60',
                amber: 'bg-amber-50 text-amber-600 border-amber-100/60',
                teal: 'bg-teal-50 text-teal-600 border-teal-100/60',
                pink: 'bg-pink-50 text-pink-600 border-pink-100/60',
                fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100/60',
              };

              return (
                <button
                  key={item.type}
                  onClick={() => handleAddNode(item)}
                  className={`w-full text-left p-3.5 bg-white border rounded-xl transition-all duration-200 cursor-pointer flex items-start space-x-3 text-xs group shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                    colors[item.color]
                  }`}
                >
                  <div className={`p-2 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${badgeColors[item.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {item.title}
                      </span>
                      <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick info/tips */}
          <div className="p-4 border-t border-slate-100 bg-white text-[11px] text-slate-400 space-y-2 leading-normal">
            <p className="font-bold text-slate-600">Quick Tips</p>
            <ul className="list-disc pl-3.5 space-y-1 text-slate-400">
              <li>Drag lines between dots to connect different inputs and outputs</li>
              <li>Add input variables on Text nodes by typing <code className="font-mono text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded">{"{{"}var_name{"}}"}</code></li>
              <li>Double-click or drag on the canvas to inspect workflow paths</li>
            </ul>
          </div>
        </aside>

        {/* Dynamic Help Side Panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              className="absolute left-80 top-0 bottom-0 w-72 bg-white border-r border-slate-200 z-20 shadow-[10px_0_30px_rgba(0,0,0,0.04)] p-5 overflow-y-auto custom-scrollbar flex flex-col justify-between text-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-1.5 text-indigo-600 font-bold">
                    <Bookmark className="w-4 h-4" />
                    <span>Dynamic Handles Guide</span>
                  </div>
                  <button onClick={() => setShowHelp(false)} className="p-1 hover:bg-slate-50 rounded text-slate-400 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-500 leading-relaxed">
                  In VectorShift, you can define template variables inside the <strong>Dynamic Text Block</strong>.
                </p>

                <div className="bg-slate-50 p-3.5 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 leading-relaxed">
                  "Hi <span className="text-emerald-600 font-bold">{"{{"} first_name {"}}"}</span>, please verify this file: <span className="text-rose-600 font-bold">{"{{"} attachment_file {"}}"}</span>."
                </div>

                <p className="text-slate-500 leading-relaxed">
                  By surrounding valid JavaScript identifiers with double curly braces:
                </p>

                <ul className="space-y-2 list-disc pl-4 text-slate-500 leading-normal">
                  <li>Input target handles are generated instantly on the left.</li>
                  <li>You can link separate node outputs directly to these handles.</li>
                  <li>The Text block automatically resizes its width and height dynamically to make inputs legible.</li>
                </ul>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-lg mt-6">
                <p className="font-semibold text-indigo-950 mb-1">Directed Acyclic Graphs (DAG):</p>
                <p className="text-slate-600 leading-normal text-[11px]">
                  Loops are forbidden in standard LLM chains. Click "Validate & Submit" to check if your workflow is loop-free!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Canvas */}
        <main className="flex-1 h-full bg-[#f8fafc] relative">
          <ReactFlow
             nodes={nodes}
             edges={edges}
             onNodesChange={onNodesChange}
             onEdgesChange={onEdgesChange}
             onConnect={onConnect}
             nodeTypes={nodeTypes}
             fitView
             minZoom={0.2}
             maxZoom={1.5}
             className="text-slate-800"
          >
            {/* Elegant light grid background */}
            <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
            <Controls className="bg-white border border-slate-200 text-slate-700 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden [&_button]:bg-white [&_button]:text-slate-500 [&_button:hover]:bg-slate-50 [&_button:hover]:text-slate-800 [&_button]:border-slate-100" />
            
            {nodes.length === 0 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-3 bg-indigo-50 border border-indigo-100/30 rounded-2xl">
                  <Workflow className="w-10 h-10 text-indigo-500 animate-pulse" />
                </div>
                <div className="max-w-sm space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Canvas is Empty</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Click a component toolkit element on the left to spawn nodes, or load the prebuilt default template.
                  </p>
                  <button
                    onClick={handleLoadSample}
                    className="mt-2 py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-md pointer-events-auto transition-colors cursor-pointer shadow-sm shadow-indigo-500/10"
                  >
                    Load Default Template Flow
                  </button>
                </div>
              </div>
            )}
          </ReactFlow>
        </main>
      </div>

      {/* SUBMIT REPORT MODAL */}
      <AnimatePresence>
        {reportData && reportData.open && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 overflow-hidden relative"
            >
              <button
                onClick={() => setReportData(null)}
                className="absolute top-4 right-4 p-1 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {reportData.loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-800">Validating graph structure...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
                    <div className={`p-2.5 rounded-xl border ${
                      reportData.is_dag 
                        ? 'bg-emerald-50 border-emerald-200/50 text-emerald-600' 
                        : 'bg-rose-50 border-rose-200/50 text-rose-600'
                    }`}>
                      {reportData.is_dag ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-sans">
                        Pipeline Validation
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Analysis Complete
                      </p>
                    </div>
                  </div>

                  {/* DAG Banner */}
                  <div className={`p-4 rounded-xl border text-center space-y-1 ${
                    reportData.is_dag 
                      ? 'bg-emerald-50 border-emerald-200/60 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200/60 text-rose-800'
                  }`}>
                    <p className="text-sm font-bold tracking-wide">
                      {reportData.is_dag 
                        ? '🟢 Valid Directed Acyclic Graph (DAG)' 
                        : '🔴 Circular Reference Detected'}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl space-y-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Total Nodes
                      </p>
                      <p className="text-2xl font-black text-indigo-600 font-mono leading-none">
                        {reportData.num_nodes}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl space-y-1">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Total Edges
                      </p>
                      <p className="text-2xl font-black text-violet-600 font-mono leading-none">
                        {reportData.num_edges}
                      </p>
                    </div>
                  </div>

                  {/* Descriptive Message */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {reportData.is_dag 
                      ? 'The workflow contains no circular dependencies. Nodes are sequenced in a valid directed acyclic graph layout, suitable for execution.' 
                      : 'A circular dependency was detected. To maintain execution flow stability, please ensure links do not create feedback loops.'}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setReportData(null)}
                      className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
