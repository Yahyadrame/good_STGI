// src/app/instructions/page.tsx
import React from "react";
import InstructionList from "./components/InstructionList";

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <InstructionList />
    </div>
  );
}
