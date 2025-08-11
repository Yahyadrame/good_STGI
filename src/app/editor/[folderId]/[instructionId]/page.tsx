"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavigationSidebar } from "@/app/features/editor/components/NavigationSidebar";
import  ToolsTable  from "@/app/features/editor/components/ToolsTable";
import { StepForm } from "@/app/features/editor/components/StepForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Step {
  id: string;
  action?: string;
  component?: string | null;
  location?: string | null;
  tool?: { name: string } | null;
  details?: string;
  objective?: string;
  media?: string;
}

interface SortableStepProps {
  step: Step;
  index: number;
  folderId: string | string[];
  instructionId: string | string[];
}

const SortableStep = ({ step, index, folderId, instructionId }: SortableStepProps) => {
  if (!step.id) {
    console.warn(`Étape à l'index ${index} n'a pas d'ID valide`, step);
    return null;
  }

  console.log(`Rendu de l'étape ${step.id}:`, step); // Journalisation pour débogage

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    router.push(`/editor/${folderId}/${instructionId}/edit/${step.id}`);
  };

  return (
    <div
      id={`step-${step.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border p-4 rounded-lg bg-white shadow hover:bg-gray-50 transition cursor-pointer"
      onClick={handleEdit}
    >
      <h3 className="font-semibold text-lg">Étape {index + 1}: {step.action || "Sans action"}</h3>
      <p className="text-gray-600">Composant: {step.component || "Non défini"}</p>
      <p className="text-gray-600">Lieu: {step.location || "Non défini"}</p>
      <p className="text-gray-600">Outil: {step.tool?.name || "Aucun outil"}</p>
      <p className="text-gray-600">Détails: {step.details || "Pas de détails"}</p>
      <p className="text-gray-600">Objectif: {step.objective || "Pas d'objectif"}</p>
      {step.media && (
        <div>
          {step.media.endsWith(".mp4") || step.media.endsWith(".mov") || step.media.endsWith(".avi") ? (
            <video src={step.media} controls className="mt-2 max-w-xs rounded" />
          ) : (
            <img src={step.media} alt="Media" className="mt-2 max-w-xs rounded" />
          )}
        </div>
      )}
    </div>
  );
};

export default function InstructionPage() {
  const { folderId, instructionId } = useParams();
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [instruction, setInstruction] = useState<{ title?: string } | null>(null);
  const [activeTool, setActiveTool] = useState<"steps" | "tools">("steps");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showStepForm, setShowStepForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formKey = useRef(Date.now());

  const fetchInstruction = useCallback(async () => {
    try {
      const response = await fetch(`/api/instructions/${instructionId}?t=${Date.now()}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Instruction non trouvée");
        }
        throw new Error("Erreur lors de la récupération de l’instruction");
      }
      const data = await response.json();
      console.log("Données de l'API /api/instructions:", data);
      setInstruction(data);
      const validSteps = Array.isArray(data.steps)
        ? data.steps
            .filter((step: any) => step && typeof step.id !== "undefined" && step.id)
            .map((step: any) => ({
              ...step,
              id: String(step.id), // Normalisation des ID en chaînes
            }))
        : [];
      console.log("Étapes valides après filtrage:", validSteps);
      setSteps(validSteps);
      setCurrentStepIndex(0);
    } catch (err) {
      console.error("Erreur dans fetchInstruction:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }, [instructionId]);

  useEffect(() => {
    fetchInstruction();
  }, [fetchInstruction]);

  const handleNavigate = (direction: "prev" | "next") => {
    const newIndex = direction === "next" ? currentStepIndex + 1 : currentStepIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStepIndex(newIndex);
      const stepElement = document.getElementById(`step-${steps[newIndex].id}`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((step) => step.id === active.id);
    const newIndex = steps.findIndex((step) => step.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      console.warn("Impossible de trouver les indices pour le drag-and-drop", { active, over });
      return;
    }

    const newSteps = arrayMove(steps, oldIndex, newIndex);
    setSteps(newSteps);
    setCurrentStepIndex(newIndex);

    try {
      await fetch("/api/steps/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: newSteps.map((step, index) => ({ id: step.id, order: index })),
        }),
      });
    } catch (error) {
      console.error("Erreur lors de la réorganisation des étapes:", error);
      setError("Impossible de réorganiser les étapes");
      await fetchInstruction();
    }
  };

  const handleStepCreated = useCallback(async () => {
    setShowStepForm(false);
    await fetchInstruction();
  }, [fetchInstruction]);

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <NavigationSidebar
          activeTool={activeTool}
          onChangeActiveTool={setActiveTool}
          steps={steps}
          folderId={folderId}
          instructionId={instructionId}
        />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p>{error}</p>
              <Button
                onClick={() => router.push(`/editor/${folderId}`)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retour au dossier
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <NavigationSidebar
        activeTool={activeTool}
        onChangeActiveTool={setActiveTool}
        steps={steps}
        folderId={folderId}
        instructionId={instructionId}
      />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{instruction?.title || "Chargement..."}</h1>
            <div className="flex space-x-2">
              <Button onClick={() => setShowStepForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" /> Ajouter une étape
              </Button>
              <Button onClick={() => setActiveTool("tools")} className="bg-gray-600 hover:bg-gray-700 text-white">
                Voir les outils
              </Button>
            </div>
          </div>
          {activeTool === "tools" ? (
            <ToolsTable />
          ) : (
            <>
              <div className="flex justify-between mb-4">
                <Button
                  onClick={() => handleNavigate("prev")}
                  disabled={currentStepIndex === 0 || steps.length === 0}
                  variant="outline"
                  className="text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Précédent
                </Button>
                <Button
                  onClick={() => handleNavigate("next")}
                  disabled={currentStepIndex === steps.length - 1 || steps.length === 0}
                  variant="outline"
                  className="text-gray-600"
                >
                  Suivant <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext
                  items={steps.map((step) => step.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {steps.length === 0 ? (
                      <p className="text-gray-500">Aucune étape disponible.</p>
                    ) : (
                      <>
                        {console.log("Rendu des étapes:", steps)} {/* Journalisation pour débogage */}
                        {steps.map((step, index) => (
                          <SortableStep
                            key={step.id}
                            step={step}
                            index={index}
                            folderId={folderId}
                            instructionId={instructionId}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
              {showStepForm && (
                <div id="step-form" className="mt-8">
                  <StepForm
                    key={formKey.current}
                    instructionId={instructionId}
                    folderId={folderId}
                    onStepCreated={handleStepCreated}
                  />
                  <Button
                    onClick={() => setShowStepForm(false)}
                    className="mt-4 bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Fermer le formulaire
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}