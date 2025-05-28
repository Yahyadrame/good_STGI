// src/app/instructions/components/StepForm.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Step } from "../types/instruction";
import { updateStep, deleteStep } from "../actions/instructionActions";

interface StepFormProps {
  step: Step;
  instructionId: number;
}

const StepForm: React.FC<StepFormProps> = ({ step, instructionId }) => {
  const router = useRouter();
  const [description, setDescription] = React.useState(step.description);
  const [image, setImage] = React.useState(step.image);

  const handleSave = async () => {
    try {
      await updateStep(instructionId, { ...step, description, image });
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (confirm("Voulez-vous vraiment supprimer cette étape ?")) {
      try {
        await deleteStep(instructionId, step.id);
        router.refresh();
      } catch (error: any) {
        alert(error.message || "Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Étape {step.stepOrder}</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-lg w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Image</label>
        {image ? (
          <div className="flex items-center gap-2">
            <img
              src={image}
              alt="Étape"
              className="w-32 h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => setImage("")}
              className="text-red-500 hover:underline"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez l'URL de l'image"
          />
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Sauvegarder
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default StepForm;
