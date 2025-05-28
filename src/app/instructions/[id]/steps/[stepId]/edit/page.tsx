"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchStep, updateStep } from "../../../../actions/instructionActions";
import { Step } from "../../../../types/instruction";
import { Editor } from "../../../../../features/editor/components/editor"; // Importation nommée
import Link from "next/link";
import { FaArrowLeft, FaSave, FaEdit } from "react-icons/fa";

export default function StepEdit() {
  const router = useRouter();
  const params = useParams();
  const instructionId = Number(params.id);
  const stepId = Number(params.stepId);

  // Vérification des paramètres
  useEffect(() => {
    if (isNaN(instructionId) || isNaN(stepId)) {
      console.error("Paramètres invalides:", { instructionId, stepId, params });
      alert("Les paramètres de l'URL sont invalides.");
      router.push("/");
    }
  }, [instructionId, stepId, router]);

  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [stepOrder, setStepOrder] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState(false); // Contrôle l'affichage de l'éditeur

  useEffect(() => {
    const loadStep = async () => {
      try {
        console.log(
          "Fetching step for edit with URL:",
          `/api/instructions/${instructionId}/steps/${stepId}`
        );
        const data = await fetchStep(instructionId, stepId);
        console.log("Données chargées:", data);
        if (data) {
          setStep(data);
          setDescription(data.description ?? "");
          setStepOrder(data.stepOrder ?? 1);
          setImageUrl(data.image ?? "");
          console.log("États mis à jour:", {
            description: data.description ?? "",
            stepOrder: data.stepOrder ?? 1,
            imageUrl: data.image ?? "",
          });
        } else {
          throw new Error("Aucune donnée retournée par le serveur");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erreur inconnue";
        console.error("Erreur détaillée:", errorMessage);
        setError(errorMessage);
        alert(`Erreur lors du chargement de l'étape: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    if (!isNaN(instructionId) && !isNaN(stepId)) {
      loadStep();
    }
  }, [instructionId, stepId]);

  const handleSave = async () => {
    if (!step) return;

    try {
      const updatedStep: Step = {
        ...step,
        description: description || step.description,
        image: imageUrl || step.image,
        stepOrder: stepOrder || step.stepOrder,
      };
      await updateStep(instructionId, updatedStep);
      alert("Étape mise à jour avec succès !");
      router.push(`/instructions/${instructionId}/steps/${stepId}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      console.error("Erreur lors de la mise à jour:", errorMessage);
      alert(`Erreur lors de la mise à jour de l'étape: ${errorMessage}`);
    }
  };

  const toggleEditor = () => {
    setIsEditorOpen(!isEditorOpen);
  };

  if (loading) {
    return <p className="text-gray-500 text-center text-lg">Chargement...</p>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-lg">
        <p>Étape non trouvée.</p>
        <p>Détail de l'erreur : {error}</p>
      </div>
    );
  }

  if (!step) {
    return (
      <p className="text-red-500 text-center text-lg">Étape non trouvée.</p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Link href={`/instructions/${instructionId}/steps/${stepId}`}>
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Retour aux détails
          </button>
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Modifier l'étape {step.stepOrder}
      </h1>
      <div className="grid grid-cols-1 gap-8">
        {/* Formulaire (champs) */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Détails</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 rounded-lg w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez la description de l'étape"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ordre de l'étape
              </label>
              <input
                type="number"
                value={stepOrder}
                onChange={(e) => setStepOrder(Number(e.target.value))}
                className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Image et bouton pour ouvrir l'éditeur */}
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Image</h2>
          {step.image ? (
            <img
              src={step.image}
              alt={`Étape ${step.stepOrder}`}
              className="w-full max-w-3xl h-auto object-cover rounded-xl shadow-md"
            />
          ) : (
            <p className="text-gray-500 italic">Aucune image disponible</p>
          )}
          <button
            onClick={toggleEditor}
            className="flex items-center bg-blue-500 text-white py-2 px-5 rounded-full hover:bg-blue-600 transition duration-300 shadow-md"
          >
            <FaEdit className="mr-2" /> Modifier l'image
          </button>

          {/* Afficher l'éditeur uniquement si isEditorOpen est true */}
          {isEditorOpen && (
            <div className="w-full max-w-3xl mt-6">
              <Editor
                initialImageUrl={imageUrl}
                onSaveImage={(newImageUrl) => {
                  console.log("Nouvelle image sauvegardée:", newImageUrl);
                  setImageUrl(newImageUrl);
                  setIsEditorOpen(false); // Ferme l'éditeur après sauvegarde
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={handleSave}
          className="flex items-center bg-green-500 text-white py-2 px-5 rounded-full hover:bg-green-600 transition duration-300 shadow-md"
        >
          <FaSave className="mr-2" /> Sauvegarder
        </button>
        <Link href={`/instructions/${instructionId}/steps/${stepId}`}>
          <button className="bg-gray-500 text-white py-2 px-5 rounded-full hover:bg-gray-600 transition duration-300 shadow-md">
            Annuler
          </button>
        </Link>
      </div>
    </div>
  );
}
