import { fabric } from "fabric";
import { useEffect } from "react";

interface UseCanvasEventsProps {
  save: () => void;
  canvas: fabric.Canvas | null;
  setSelectedObjects: (selectedObject: fabric.Object[]) => void;
  clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({
  save,
  canvas,
  setSelectedObjects,
  clearSelectionCallback,
}: UseCanvasEventsProps) => {
  useEffect(() => {
    if (!canvas) return;

    const handleObjectAdded = () => save();
    const handleObjectRemoved = () => save();
    const handleObjectModified = () => {
      save();
      setSelectedObjects(canvas.getActiveObjects()); // Mise à jour après modification
    };
    const handleSelectionCreated = (e: fabric.IEvent) => {
      console.log("selection:created", e);
      setSelectedObjects(e.selected || []);
    };
    const handleSelectionUpdated = (e: fabric.IEvent) => {
      console.log("selection:updated", e);
      setSelectedObjects(e.selected || []);
    };
    const handleSelectionCleared = (e: fabric.IEvent) => {
      setSelectedObjects([]);
      clearSelectionCallback?.();
    };

    canvas.on("object:added", handleObjectAdded);
    canvas.on("object:removed", handleObjectRemoved);
    canvas.on("object:modified", handleObjectModified);
    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      if (canvas) {
        canvas.off("object:added", handleObjectAdded);
        canvas.off("object:removed", handleObjectRemoved);
        canvas.off("object:modified", handleObjectModified);
        canvas.off("selection:created", handleSelectionCreated);
        canvas.off("selection:updated", handleSelectionUpdated);
        canvas.off("selection:cleared", handleSelectionCleared);
      }
    };
  }, [canvas, clearSelectionCallback, setSelectedObjects, save]);
};
