// src/config/apiConfig.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    INSTRUCTIONS: "/api/instructions",
    INSTRUCTION: (id: number) => `/api/instructions/${id}`,
    STEPS: (instructionId: number) =>
      `/api/instructions/${instructionId}/steps`,
    STEP: (instructionId: number, stepId: number) =>
      `/api/instructions/${instructionId}/steps/${stepId}`,
  },
};
