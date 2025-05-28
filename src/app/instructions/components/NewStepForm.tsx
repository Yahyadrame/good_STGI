"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchInstruction, addStep } from "../actions/instructionActions";

interface NewStepFormProps {
  instructionId: number;
}

const NewStepForm: React.FC<NewStepFormProps> = ({ instructionId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [stepOrder, setStepOrder] = useState(1);
  const [imageAdded, setImageAdded] = useState(false);

  useEffect(() => {
    const imageUrl = searchParams.get("imageUrl");
    if (imageUrl) {
      setImage(decodeURIComponent(imageUrl));
      setImageAdded(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadStepOrder = async () => {
      try {
        const instruction = await fetchInstruction(instructionId);
        const maxStepOrder =
          instruction.steps.length > 0
            ? Math.max(...instruction.steps.map((step) => step.stepOrder))
            : 0;
        setStepOrder(maxStepOrder + 1);
      } catch (error) {
        console.error("Erreur lors du chargement de l'instruction:", error);
      }
    };
    loadStepOrder();
  }, [instructionId]);

  const handleGoToEditor = () => {
    if (description.trim()) {
      router.push(
        `/editor/${instructionId}?returnTo=/instructions/${instructionId}/steps/new`
      );
    } else {
      alert("Veuillez entrer une description avant de passer à l'éditeur.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("La description est requise.");
      return;
    }
    if (!imageAdded) {
      alert("Veuillez ajouter une image via l'éditeur avant de valider.");
      return;
    }
    try {
      await addStep(instructionId, { description, image, stepOrder });
      router.push(`/instructions/${instructionId}`);
    } catch (error: any) {
      alert(error.message || "Erreur lors de l'ajout de l'étape");
    }
  };

  return (
    <div className="border p-4 mb-4 rounded-lg shadow-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Ajouter une nouvelle étape</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded-lg w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez la description de l'étape"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Image (URL)
          </label>
          <input
            type="text"
            value={image}
            readOnly
            className="border p-2 rounded-lg w-full bg-gray-100"
          />
          <button
            type="button"
            onClick={handleGoToEditor}
            className="mt-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
          >
            Ajouter une image via l'éditeur
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ordre de l'étape
          </label>
          <input
            type="number"
            value={stepOrder}
            readOnly
            className="border p-2 rounded-lg w-full bg-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={!imageAdded}
          className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
};

export default NewStepForm;
