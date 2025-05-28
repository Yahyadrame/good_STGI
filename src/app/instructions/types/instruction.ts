export type Step = {
  id: number;
  instructionId: number;
  description: string;
  image: string;
  stepOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Instruction = {
  id: number;
  title: string;
  description: string;
  guideOrder: number; 
  steps: Step[];
  createdAt?: string;
  updatedAt?: string;
};
