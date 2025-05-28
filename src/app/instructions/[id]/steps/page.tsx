"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchStep } from "../../../actions/instructionActions";
import { Step } from "../../../types/instruction";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function StepDetails() {
  const router = useRouter();
  const params = useParams();
  const instructionId = Number(params.id);
  const stepId = Number(params.stepId);
  const [step, setStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStep = async () => {
      try {
        const data = await fetchStep(instructionId, stepId);
        setStep(data);
      } catch (error) {
        console.error("Erreur lors du chargement de l'étape:", error);
        alert("Erreur lors du chargement de l'étape.");
      } finally {
        setLoading(false);
      }
    };
    loadStep();
  }, [instructionId, stepId]);

  if (loading) {
    return <p className="text-gray-500 text-center text-lg">Chargement...</p>;
  }

  if (!step) {
    return (
      <p className="text-red-500 text-center text-lg">Étape non trouvée.</p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center mb-8">
        <Link href={`/instructions/${instructionId}`}>
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Retour aux instructions
          </button>
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Détails de l'étape {step.stepOrder}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center">
          {step.image ? (
            <img
              src={step.image}
              alt={`Étape ${step.stepOrder}`}
              className="w-full max-w-md h-auto object-cover rounded-xl shadow-lg"
            />
          ) : (
            <p className="text-gray-500 italic">Aucune image disponible</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Description
          </h2>
          <p className="text-gray-700 leading-relaxed">{step.description}</p>
        </div>
      </div>
      <div className="flex justify-center space-x-4 mt-8">
        <Link href={`/instructions/${instructionId}/steps/${stepId}/edit`}>
          <button className="bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 transition duration-300 shadow-md">
            Modifier cette étape
          </button>
        </Link>
        <Link href={`/instructions/${instructionId}`}>
          <button className="bg-gray-500 text-white py-3 px-6 rounded-full hover:bg-gray-600 transition duration-300 shadow-md">
            Retour
          </button>
        </Link>
      </div>
    </div>
  );
}
