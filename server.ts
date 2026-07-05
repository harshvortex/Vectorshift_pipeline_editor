import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON limit for large codebases and payloads
app.use(express.json({ limit: '15mb' }));

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required but was not found. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ----------------- API ROUTES -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Architecture Analysis Endpoint
app.post('/api/analyze-architecture', async (req, res) => {
  try {
    const { files, sampleContents } = req.body;
    const ai = getGemini();

    const filesStr = files
      .map((f: any) => `- ${f.name} (Path: ${f.path || f.name}, MIME: ${f.mimeType}, Size: ${f.size || 'unknown'})`)
      .join('\n');

    const samplesStr = sampleContents && sampleContents.length > 0
      ? sampleContents.map((s: any) => `\n--- File: ${s.name} ---\n${s.content.slice(0, 3000)}`).join('\n')
      : '';

    const systemInstruction = `You are a distinguished Google Principal Software Architect and engineering fellow. Your job is to perform a rigorous architectural audit of a software project. Analyze its structure, detected frameworks, design patterns, quality of modularity, and dependencies. Provide concrete recommendations. Output MUST strictly follow the requested JSON schema. Include a professional Mermaid.js architectural/class/flow diagram visualizing the system.`;

    const prompt = `Perform a software architecture audit for a project with the following file structure and key file contents.

FILE TREE:
${filesStr}

KEY FILES SAMPLES:
${samplesStr}

Analyze and return the architectural audit in the exact JSON schema requested. Give realistic, deep insights suitable for a senior developer. Use Mermaid.js diagrams to explain components and their interactions in "mermaidDiagram".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'High-level architectural summary of the project.' },
            detectedTechnologies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Frameworks, runtimes, and major packages detected.',
            },
            designPatterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Pattern name (e.g., Repository, MVC, MVC, Hook, PubSub).' },
                  description: { type: Type.STRING, description: 'Explanation of this pattern.' },
                  usageInProject: { type: Type.STRING, description: 'How it is or can be used/observed in the user\'s codebase.' },
                },
                required: ['name', 'description', 'usageInProject'],
              },
            },
            components: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Component or layer name (e.g. Frontend, API routes, DB client).' },
                  role: { type: Type.STRING, description: 'Its function in the architecture.' },
                  responsibilities: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Primary duties.' },
                },
                required: ['name', 'role', 'responsibilities'],
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Short title of recommendation.' },
                  priority: { type: Type.STRING, description: 'high, medium, or low.' },
                  description: { type: Type.STRING, description: 'Detailed technical explanation.' },
                  benefit: { type: Type.STRING, description: 'What we gain by implementing this.' },
                },
                required: ['title', 'priority', 'description', 'benefit'],
              },
            },
            mermaidDiagram: {
              type: Type.STRING,
              description: 'A professional Mermaid.js flowchart, sequence diagram, or architecture block diagram illustrating the component interactions. Use "graph TD" style. Exclude ```mermaid brackets.',
            },
          },
          required: ['summary', 'detectedTechnologies', 'designPatterns', 'components', 'recommendations', 'mermaidDiagram'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Architecture analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze architecture.' });
  }
});

// Code Review Endpoint
app.post('/api/review-code', async (req, res) => {
  try {
    const { fileName, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Code content is required for review.' });
    }

    const ai = getGemini();

    const systemInstruction = `You are an elite Senior Staff Software Engineer and clean code champion. Perform a meticulous, line-by-line review of the provided file. Identify performance leaks, security vulnerabilities, architectural mismatches, bad styling/practices, or actual bugs. Be highly constructional, encouraging, but technically uncompromising. Always suggest clean, modernized alternatives. Return a JSON array of issues matching the schema.`;

    const prompt = `Perform a full code review on the file: "${fileName}".
    
CODE CONTENT:
\`\`\`
${content}
\`\`\`

Analyze and return issues matching the required schema. Ensure you specify exact line numbers if applicable (1-indexed).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              line: { type: Type.INTEGER, description: 'The 1-indexed line number where the issue occurs, if specific. Otherwise leave blank.' },
              severity: { type: Type.STRING, description: 'error (critical bug/security), warning (smell/suboptimal), or info (best practice/optimization).' },
              category: { type: Type.STRING, description: 'performance, security, style, bug, or design.' },
              title: { type: Type.STRING, description: 'Brief title of the issue.' },
              description: { type: Type.STRING, description: 'Explanation of what is wrong or smells.' },
              recommendation: { type: Type.STRING, description: 'Clear, actionable instruction and code block illustrating how to refactor or fix it.' },
            },
            required: ['severity', 'category', 'title', 'description', 'recommendation'],
          },
        },
      },
    });

    const issues = JSON.parse(response.text || '[]');
    res.json({ issues });
  } catch (error: any) {
    console.error('Code review error:', error);
    res.status(500).json({ error: error.message || 'Failed to review code.' });
  }
});

// Mentor Chat Endpoint
app.post('/api/mentor-chat', async (req, res) => {
  try {
    const { messages, files, selectedFile } = req.body;
    const ai = getGemini();

    // Context preparation
    const filesSummary = files && files.length > 0
      ? files.map((f: any) => `- ${f.name} (Path: ${f.path || f.name}, MIME: ${f.mimeType})`).join('\n')
      : 'No files loaded yet.';

    const selectedFileContext = selectedFile
      ? `Currently selected file: "${selectedFile.name}" (Path: ${selectedFile.path || selectedFile.name})\nContent:\n\`\`\`\n${selectedFile.content || ''}\n\`\`\``
      : 'No specific file is currently opened.';

    const systemInstruction = `You are a distinguished, incredibly brilliant Senior Software Architect and engineering mentor.
Your task is to mentor a software developer, helping them make great architectural choices, write clean code, and design highly scalable, secure systems.
You have full context of their project's folder structure and their active code.

CONTEXT RULES:
1. Always align your advice with elite enterprise best practices (separation of concerns, SOLID, DRY, clean code, appropriate cloud architectures).
2. Avoid generic, dry advice. Tailor answers specifically to the files, frameworks, and patterns detected in their project.
3. Be highly encouraging but uncompromisingly technical. Explain the 'why' behind choices (e.g. why Redux vs Context, why SQL vs NoSQL, why microservices vs modular monoliths).
4. Provide elegant, concise code snippets in TypeScript/JavaScript or relevant language to illustrate architecture.
5. Address the user directly as a mentor. Use professional, friendly, and structured developer-to-developer tone.

Active Project Files:
${filesSummary}

${selectedFileContext}`;

    // Map frontend chat format to Gemini API contents structure
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error('Mentor chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch chatbot response.' });
  }
});

// Mock Scenario Interview Generator
app.post('/api/generate-scenario', async (req, res) => {
  try {
    const { files } = req.body;
    const ai = getGemini();

    const filesStr = files && files.length > 0
      ? files.map((f: any) => `- ${f.name} (Path: ${f.path || f.name})`).join('\n')
      : 'No files.';

    const systemInstruction = `You are an elite System Design Interviewer and Software Architecture Coach. Your goal is to design a realistic, highly technical, and challenging software design scenario or interview question based on the user's codebase or file structure. The question should push the user to think like a senior architect (e.g., scaling, high availability, database partitioning, secure API proxy, real-time sync, caching layer). Return the result in the requested JSON format.`;

    const prompt = `Based on the following files in the project, design a challenging architectural design scenario.
FILE STRUCTURE:
${filesStr}

Create an interview question/exercise testing senior architectural decision making. Focus on a scaling or architectural improvement that would be highly relevant to this kind of project. Return the question matching the required JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'A unique string ID.' },
            scenario: { type: Type.STRING, description: 'The rich backstory/scenario (e.g., "The client demands real-time multiplayer updates but our database is single-thread...").' },
            question: { type: Type.STRING, description: 'The core question the user must answer (e.g., "How would you design the cache layer, coordinate events, and handle split-brain in this cluster?").' },
            hints: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3 helpful hints to nudge them.' },
            evaluationCriteria: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'What elements a strong architect answer should address (e.g. data consistency, backpressure, etc.).' },
          },
          required: ['id', 'scenario', 'question', 'hints', 'evaluationCriteria'],
        },
      },
    });

    const question = JSON.parse(response.text || '{}');
    res.json(question);
  } catch (error: any) {
    console.error('Scenario generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate scenario.' });
  }
});

// Evaluate Scenario Answer Endpoint
app.post('/api/evaluate-response', async (req, res) => {
  try {
    const { scenario, question, answer } = req.body;
    const ai = getGemini();

    const systemInstruction = `You are an expert Principal Software Architect and Board Review Interviewer. Evaluate the user's architectural solution/answer to the given scenario. Be rigorous, constructive, and analytical. Highlight what is exceptionally engineered in their answer, what security or scalability holes they left open (gaps), and provide concrete advice a senior architect would give. Return a JSON object matching the requested schema.`;

    const prompt = `Evaluate this architect response.

SCENARIO:
${scenario}

QUESTION:
${question}

USER'S SOLUTION:
${answer}

Analyze and return feedback, score (0-100), key strengths, gaps, and architect's advice matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING, description: 'General review feedback on their solution.' },
            score: { type: Type.INTEGER, description: 'A score from 0 to 100 assessing completeness, safety, scalability, and design trade-offs.' },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of strong, correct decisions in their answer.' },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of architectural, performance, or security weaknesses or omissions.' },
            architectAdvice: { type: Type.STRING, description: 'Detailed staff-level technical advice on how to improve the design with patterns/technologies.' },
          },
          required: ['feedback', 'score', 'keyStrengths', 'gaps', 'architectAdvice'],
        },
      },
    });

    const evaluation = JSON.parse(response.text || '{}');
    res.json(evaluation);
  } catch (error: any) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate response.' });
  }
});

// Pipelines Parse (DAG Check) Endpoint
app.post('/api/pipelines/parse', (req, res) => {
  try {
    const { nodes = [], edges = [] } = req.body;
    const num_nodes = nodes.length;
    const num_edges = edges.length;

    // Build adjacency list for cycle detection
    const adjList = new Map<string, string[]>();
    nodes.forEach((node: any) => {
      adjList.set(String(node.id), []);
    });

    edges.forEach((edge: any) => {
      const source = String(edge.source);
      const target = String(edge.target);
      if (adjList.has(source)) {
        adjList.get(source)!.push(target);
      }
    });

    // Cycle detection states: 0 = unvisited, 1 = visiting, 2 = visited
    const state = new Map<string, number>();
    nodes.forEach((node: any) => {
      state.set(String(node.id), 0);
    });

    let hasCycle = false;

    function dfs(nodeId: string): boolean {
      state.set(nodeId, 1); // Mark as visiting

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const neighborState = state.get(neighbor) ?? 0;
        if (neighborState === 1) {
          return true; // Cycle detected
        }
        if (neighborState === 0) {
          if (dfs(neighbor)) {
            return true;
          }
        }
      }

      state.set(nodeId, 2); // Mark as fully visited
      return false;
    }

    // Run DFS starting from each unvisited node
    for (const node of nodes) {
      const nodeId = String(node.id);
      if (state.get(nodeId) === 0) {
        if (dfs(nodeId)) {
          hasCycle = true;
          break;
        }
      }
    }

    const is_dag = !hasCycle;

    res.json({
      num_nodes,
      num_edges,
      is_dag,
    });
  } catch (error: any) {
    console.error('Pipelines parse error:', error);
    res.status(500).json({ error: error.message || 'Failed to parse pipeline.' });
  }
});


// ----------------- VITE MIDDLEWARE SETUP & START -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Senior Architect Mentor Dev Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
