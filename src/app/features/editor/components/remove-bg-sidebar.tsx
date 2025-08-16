import { cn } from "@/lib/utils";
import { ActiveTool, Editor, FILL_COLORS } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRemoveBg } from "../../ai/api/use-remove-bg";
import { useState } from "react";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };
  const mutation = useRemoveBg();
  const selectedObject = editor?.selectedObjects[0];

  const isImageObject = selectedObject?.type === "image";
  const imageSrc = isImageObject ? selectedObject?._element?.currentSrc || selectedObject?.getElement()?.currentSrc : null;

  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF"); // Couleur par défaut : blanc

  const onRemoveBg = () => {
    if (!editor || !imageSrc || !editor.canvas) {
      console.error("No editor, image, or canvas available for background removal");
      return;
    }

    console.log("Mutating with image:", imageSrc);
    mutation.mutate(
      { image: imageSrc },
      {
        onSuccess: (data) => {
          console.log("Mutation success, data:", data);
          if (data && typeof data === "string") {
            // Récupérer la position et les dimensions de l'image sélectionnée
            const { left, top, width, height } = selectedObject;
            // Supprimer l'image actuelle
            editor.canvas.remove(selectedObject);
            // Ajouter la nouvelle image avec la couleur d'arrière-plan
            fabric.Image.fromURL(data, (img) => {
              img.set({
                left: left || 0,
                top: top || 0,
                width: width || 100,
                height: height || 100,
                backgroundColor: backgroundColor, // Appliquer la couleur d'arrière-plan
              });
              editor.canvas.add(img);
              editor.canvas.renderAll();
            });
          } else {
            console.error("Invalid data format from API:", data);
          }
        },
        onError: (error) => {
          console.error("Error removing background:", {
            message: error?.message || "No message",
            stack: error?.stack || new Error().stack,
            errorObject: error,
            mutationState: mutation.state,
          });
        },
      }
    );
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden"
      )}
    >
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Please select an image to remove background
          </p>
        </div>
      )}
      <ToolSidebarHeader
        title="Background removal"
        description="remove background from your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {imageSrc && (
            <div
              className={cn(
                "relative aspect-square rounded-md overflow-hidden transition bg-muted",
                mutation.isLoading && "opacity-50" // Animation de chargement via opacité
              )}
            >
              <Image
                src={imageSrc}
                alt="Image"
                fill
                sizes="(max-width: 360px) 100vw, 360px"
                className="object-cover"
              />
            </div>
          )}
          {imageSrc && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="bg-color" className="text-sm font-medium">
                  Background Color:
                </label>
                <input
                  id="bg-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 p-1 border rounded"
                />
              </div>
              <Button
                onClick={onRemoveBg}
                disabled={mutation.isLoading}
                className="w-full"
              >
                {mutation.isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 inline-block"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Removing...
                  </>
                ) : (
                  "Remove Background"
                )}
              </Button>
            </>
          )}
          {mutation.isError && (
            <p className="text-red-500 text-xs">
              Error: {mutation.error?.message || "Failed to remove background"}
            </p>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};