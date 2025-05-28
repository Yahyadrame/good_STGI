"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchStep } from "../../../actions/instructionActions";
import { Step } from "../../../types/instruction";
import Link from "next/link";
import { FaArrowLeft, FaExpand } from "react-icons/fa";

export default function StepDetails() {
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
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour la modale

  useEffect(() => {
    const loadStep = async () => {
      try {
        console.log(
          "Fetching step with URL:",
          `/api/instructions/${instructionId}/steps/${stepId}`
        );
        const data = await fetchStep(instructionId, stepId);
        setStep(data);
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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center mb-6">
        <Link href={`/instructions/${instructionId}`}>
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Retour aux instructions
          </button>
        </Link>
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
        Détails de l'étape {step.stepOrder}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          {step.image ? (
            <>
              <img
                src={step.image}
                alt={`Étape ${step.stepOrder}`}
                className="w-64 h-64 object-cover rounded-xl shadow-md"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 text-blue-500 hover:text-blue-700 flex items-center"
                title="Agrandir l'image"
              >
                <FaExpand className="mr-1" /> Voir l'image
              </button>
            </>
          ) : (
            <p className="text-gray-500 italic">Aucune image disponible</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Description
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-6">
        <Link href={`/instructions/${instructionId}/steps/${stepId}/edit`}>
          <button className="bg-green-500 text-white py-2 px-5 rounded-full hover:bg-green-600 transition duration-300 shadow-md">
            Modifier cette étape
          </button>
        </Link>
        <Link href={`/instructions/${instructionId}`}>
          <button className="bg-gray-500 text-white py-2 px-5 rounded-full hover:bg-gray-600 transition duration-300 shadow-md">
            Retour
          </button>
        </Link>
      </div>

      {/* Modale pour agrandir l'image */}
      {isModalOpen && step.image && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl">
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-500 hover:text-red-700"
              >
                Fermer
              </button>
            </div>
            <img
              src={step.image}
              alt={`Étape ${step.stepOrder} (agrandie)`}
              className="w-full h-auto max-h-[180vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
