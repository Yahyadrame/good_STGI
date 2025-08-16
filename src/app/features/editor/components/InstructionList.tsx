"use client";

import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableInstructionProps {
  instruction: any;
  folderId: string | string[];
}

const SortableInstruction = ({
  instruction,
  folderId,
}: SortableInstructionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: instruction.id.toString() });
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="border p-4 rounded-lg bg-white shadow hover:bg-gray-50 transition cursor-pointer"
      onClick={() => router.push(`/editor/${folderId}/${instruction.id}`)}
      aria-label={`Déplacer l'instruction ${instruction.title}`}
      role="button"
      tabIndex={0}
    >
      <h3 className="font-semibold text-lg">{instruction.title}</h3>
      <p className="text-gray-600">Étapes: {instruction.steps?.length || 0}</p>
    </div>
  );
};

interface InstructionListProps {
  instructions: any[];
  folderId: string | string[];
}

export const InstructionList = ({
  instructions,
  folderId,
}: InstructionListProps) => {
  return (
    <div className="space-y-4">
      {instructions.length === 0 ? (
        <p className="text-gray-500">Aucune instruction disponible.</p>
      ) : (
        instructions.map((instruction) => (
          <SortableInstruction
            key={instruction.id}
            instruction={instruction}
            folderId={folderId}
          />
        ))
      )}
    </div>
  );
};
