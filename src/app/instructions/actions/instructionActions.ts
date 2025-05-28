// src/app/actions/instructionActions.ts

import { Instruction, Step } from "../types/instruction";
import { API_CONFIG } from "@/config/apiConfig";

const { BASE_URL, ENDPOINTS } = API_CONFIG;

const buildUrl = (path: string) => {
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in API_CONFIG");
  }
  return `${BASE_URL}${path}`;
};

export async function fetchInstructions() {
  try {
    const response = await fetch(buildUrl(ENDPOINTS.INSTRUCTIONS), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des instructions: ${error.message}`
    );
  }
}

export async function fetchInstruction(id: number): Promise<Instruction> {
  const url = buildUrl(ENDPOINTS.INSTRUCTION(id));
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors du chargement de l'instruction: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

export async function createInstruction(instructionData: {
  title: string;
  description: string;
  steps: any[];
  guideOrder: number;
}) {
  const url = buildUrl(ENDPOINTS.INSTRUCTIONS);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instructionData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la création: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

export async function saveInstruction(instruction: Instruction) {
  const url = buildUrl(ENDPOINTS.INSTRUCTION(instruction.id));
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instruction),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la sauvegarde de l'instruction: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

export async function deleteInstruction(id: number) {
  const url = buildUrl(ENDPOINTS.INSTRUCTION(id));
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la suppression: ${response.status} ${errorText}`
    );
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
}

interface StepData {
  description: string;
  image: string; // URL de l'image depuis UploadThing
  stepOrder: number;
}

export async function addStep(instructionId: number, stepData: StepData) {
  try {
    const url = buildUrl(`/api/instructions/${instructionId}/steps`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: stepData.description,
        image: stepData.image,
        stepOrder: stepData.stepOrder,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur lors de la création de l'étape: ${response.status} ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(`Erreur lors de la création de l'étape: ${error.message}`);
  }
}

export async function updateStep(instructionId: number, step: Step) {
  const url = buildUrl(`/api/instructions/${instructionId}/steps/${step.id}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(step),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la mise à jour de l'étape: ${response.status} ${errorText}`
    );
  }
  return response.json();
}

export async function deleteStep(instructionId: number, stepId: number) {
  const url = buildUrl(`/api/instructions/${instructionId}/steps/${stepId}`);
  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erreur lors de la suppression de l'étape: ${response.status} ${errorText}`
    );
  }
  if (response.status === 204) {
    return; // Suppression réussie
  }
  return response.json();
}

export async function fetchStep(
  instructionId: number,
  stepId: number
): Promise<Step> {
  try {
    const url = buildUrl(`/api/instructions/${instructionId}/steps/${stepId}`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur lors du chargement de l'étape: ${response.status} ${errorText}`
      );
    }

    return response.json();
  } catch (error) {
    throw new Error(`Erreur lors du chargement de l'étape: ${error.message}`);
  }
}
