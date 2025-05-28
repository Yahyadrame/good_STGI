"use client";

import React, { useState, useEffect } from "react";
import {
  fetchInstructions,
  createInstruction,
} from "../actions/instructionActions";
import Link from "next/link";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { deleteInstruction } from "../actions/instructionActions";
import InstructionForm from "./InstructionForm";

export default function InstructionList() {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadInstructions = async () => {
    try {
      const data = await fetchInstructions();
      setInstructions(data);
    } catch (error) {
      console.error("Erreur lors du chargement des instructions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstructions();
    const intervalId = setInterval(loadInstructions, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette instruction ?")) {
      try {
        await deleteInstruction(id);
        await loadInstructions();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de l'instruction.");
      }
    }
  };

  const handleCreateInstruction = async (
    title: string,
    description: string
  ) => {
    try {
      const maxGuideOrder =
        instructions.length > 0
          ? Math.max(...instructions.map((inst) => inst.guideOrder))
          : 0;
      const newGuideOrder = maxGuideOrder + 1;
      const newInstruction = {
        title,
        description,
        steps: [],
        guideOrder: newGuideOrder,
      };
      await createInstruction(newInstruction);
      await loadInstructions();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(error.message || "Erreur lors de la création de l'instruction");
    }
  };

  if (loading) {
    return <p className="text-gray-500">Chargement...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Liste des instructions
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
        >
          Nouvelle instruction
        </button>
      </div>
      {instructions.length === 0 ? (
        <p className="text-gray-500">Aucune instruction trouvée.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Titre</th>
              <th className="border p-2 text-left">Étapes</th>
              <th className="border p-2 text-left">Créé le</th>
              <th className="border p-2 text-left">Ordre</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructions.map((instruction) => (
              <tr key={instruction.id} className="border">
                <td className="border p-2">{instruction.title}</td>
                <td className="border p-2">{instruction.steps.length}</td>
                <td className="border p-2">
                  {instruction.createdAt
                    ? new Date(instruction.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="border p-2">{instruction.guideOrder}</td>
                <td className="border p-2 space-x-2">
                  <Link href={`/instructions/${instruction.id}`}>
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      title="Voir/Éditer"
                    >
                      <FaEye />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(instruction.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <FaTrash />
                  </button>
                  <Link href={`/instructions/${instruction.id}`}>
                    <button
                      className="text-green-500 hover:text-green-700"
                      title="Modifier"
                    >
                      <FaEdit />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nouvelle instruction</h2>
            <InstructionForm
              onSubmit={handleCreateInstruction}
              onClose={() => setIsModalOpen(false)}
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
