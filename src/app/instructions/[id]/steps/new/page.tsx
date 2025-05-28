"use client";

import React from "react";
import { useParams } from "next/navigation";
import NewStepForm from "../../../components/NewStepForm"; // Ajuste le chemin selon ta structure

export default function NewStep() {
  const params = useParams();
  const instructionId = Number(params.id);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Ajouter une nouvelle étape
      </h1>
      <NewStepForm instructionId={instructionId} />
    </div>
  );
}
