"use client";

import React, { useState } from "react";
import { Instruction } from "../types/instruction";
import { createInstruction } from "../actions/instructionActions";

interface InstructionFormProps {
  onSubmit: (title: string, description: string) => void; // Retire guideOrder
  onClose: () => void;
}

const InstructionForm: React.FC<InstructionFormProps> = ({
  onSubmit,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Le titre et la description sont requis.");
      return;
    }
    onSubmit(title, description); // Ne passe plus guideOrder
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez le titre de l'instruction"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-lg w-full h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez la description de l'instruction"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
        >
          Créer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default InstructionForm;
