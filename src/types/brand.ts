export interface ExtractedStyleData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  typography: {
    style: 'serif' | 'sans-serif' | 'display' | 'handwritten' | 'monospace';
    weight: 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
    mood: string;
  };
  mood: {
    primary: string;
    keywords: string[];
    tone: 'warm' | 'cool' | 'neutral';
  };
  visualStyle: {
    complexity: 'minimal' | 'moderate' | 'detailed' | 'ornate';
    contrast: 'low' | 'medium' | 'high';
    texture: string;
  };
  confidence: number;
  extractedAt?: string;
  sourceImages?: string[];
}

export interface BrandStyle {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headingFont?: string;
  tone?: string;
  keywords?: string[];
  referenceImages?: string[];
  extractedStyle?: ExtractedStyleData;
}
