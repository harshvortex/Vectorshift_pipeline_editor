export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parentId?: string;
  size?: string;
  content?: string;
  path?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ReviewIssue {
  line?: number;
  severity: 'info' | 'warning' | 'error';
  category: 'performance' | 'security' | 'style' | 'bug' | 'design';
  title: string;
  description: string;
  recommendation: string;
}

export interface ArchitectureData {
  summary: string;
  detectedTechnologies: string[];
  designPatterns: {
    name: string;
    description: string;
    usageInProject: string;
  }[];
  components: {
    name: string;
    role: string;
    responsibilities: string[];
  }[];
  recommendations: {
    title: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    benefit: string;
  }[];
  mermaidDiagram?: string;
}

export interface SimulationQuestion {
  id: string;
  scenario: string;
  question: string;
  hints: string[];
  evaluationCriteria: string[];
}

export interface SimulationResult {
  feedback: string;
  score: number; // 0-100
  keyStrengths: string[];
  gaps: string[];
  architectAdvice: string;
}
