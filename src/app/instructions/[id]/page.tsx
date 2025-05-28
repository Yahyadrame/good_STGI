"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchInstruction, deleteStep } from "../actions/instructionActions";
import Link from "next/link";
import { Step } from "../types/instruction";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function InstructionDetails() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [instruction, setInstruction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInstruction = async () => {
      try {
        const data = await fetchInstruction(id);
        setInstruction(data);
      } catch (error) {
        console.error("Erreur lors du chargement de l'instruction:", error);
        alert("Erreur lors du chargement de l'instruction.");
      } finally {
        setLoading(false);
      }
    };
    loadInstruction();
  }, [id]);

  const handleDeleteStep = async (stepId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette étape ?")) {
      try {
        await deleteStep(id, stepId);
        // Mise à jour de l'état local
        setInstruction((prev) => ({
          ...prev,
          steps: prev.steps.filter((step: Step) => step.id !== stepId),
        }));
        // Rafraîchissement automatique
        router.refresh(); // Rafraîchit la page côté client
      } catch (error) {
        console.error("Erreur lors de la suppression de l'étape:", error);
        alert("Erreur lors de la suppression de l'étape.");
      }
    }
  };

  const handleViewStep = (stepId: number) => {
    router.push(`/instructions/${id}/steps/${stepId}`);
  };

  const handleEditStep = (stepId: number) => {
    router.push(`/instructions/${id}/steps/${stepId}/edit`);
  };

  if (loading) {
    return <p className="text-gray-500 text-center text-lg">Chargement...</p>;
  }

  if (!instruction) {
    return (
      <p className="text-red-500 text-center text-lg">
        Instruction non trouvée.
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-r from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Détails de l'instruction :{" "}
        <span className="text-blue-600">{instruction.title}</span>
      </h1>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">Étapes</h2>
        <div className="space-x-4">
          <Link href={`/instructions/${id}/steps/new`}>
            <button className="bg-blue-600 text-white py-3 px-6 rounded-full hover:bg-blue-700 transition duration-300 shadow-md">
              Ajouter une étape
            </button>
          </Link>
        </div>
      </div>
      {instruction.steps.length === 0 ? (
        <p className="text-gray-500 text-center text-lg">
          Aucune étape pour cette instruction.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instruction.steps.map((step: Step) => (
            <div
              key={step.id}
              className="border border-gray-200 p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Étape {step.stepOrder}
                </h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleViewStep(step.id)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Voir"
                  >
                    <FaEye size={20} />
                  </button>
                  <button
                    onClick={() => handleEditStep(step.id)}
                    className="text-green-500 hover:text-green-700"
                    title="Modifier"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {step.description}
              </p>
              {step.image && (
                <img
                  src={step.image}
                  alt={`Étape ${step.stepOrder}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
