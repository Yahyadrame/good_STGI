"use client"; // Add this at the top

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../hooks/use-editor";
import { fabric } from "fabric";
import { NavBar } from "./NavBar";
import { SideBar } from "./SideBar";
import { Toolbar } from "./Toolbar";
import { Footer } from "./Footer";
import { ActiveTool, selectionDependentTools } from "../../types";
import { ShapesSidebar } from "./shapes-sidebar";
import { FillColorSidebar } from "./fill-color-sidebar";
import { StrokeColorSidebar } from "./stroke-color-sidebar";
import { StrokWidthSidebar } from "./stroke-width-sidebar";
import { OpacitySidebar } from "./opacity-sidebar";
import { TextSidebar } from "./text-sidebar";
import { FontSidebar } from "./font-sidebar";
import { ImageSidebar } from "./image-sidebar";
import { FilterSidebar } from "./filter-sidebar";
import { RemoveBgSidebar } from "./remove-bg-sidebar";
import { AiSidebar } from "./ai-sidebar";
import { DrawSidebar } from "./draw-sidebar";
import { SettingsSidebar } from "./settings-sidebar";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useUploadThing } from "../../../../lib/uploadthing"; // Ajuste le chemin selon ton projet

export const Editor = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const { init, editor } = useEditor({
    clearSelectionCallback: () => {
      if (selectionDependentTools.includes(activeTool)) {
        setActiveTool("select");
      }
    },
  });
  const onChangeActiveTool = useCallback(
    (tool: ActiveTool) => {
      if (tool === "draw") {
        editor?.enabledDrawingMode();
      }
      if (activeTool === "draw") {
        editor?.disabledDrawingMode();
      }
      if (tool === activeTool) {
        return setActiveTool("select");
      }
      setActiveTool(tool);
    },
    [activeTool, editor]
  );
  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed:", res);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
    },
    onUploadBegin: ({ file }) => {
      console.log("Upload has begun for", file);
    },
  });

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      uniScaleTransform: false,
      rotatingPointOffset: 40,
    });
    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  const handleSaveImage = async () => {
    if (editor?.canvas) {
      console.log("Starting save image process");
      const dataUrl = editor.canvas.toDataURL({
        format: "png",
        quality: 0.8,
      });
      console.log("Data URL generated:", dataUrl.substring(0, 50) + "..."); // Log premiers caractères
      const instructionId = params?.id || searchParams.get("instructionId");
      const returnTo =
        searchParams.get("returnTo") ||
        `/instructions/${instructionId}/steps/new`;

      try {
        console.log("Converting to blob...");
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], "canvas-image.png", {
          type: "image/png",
        });
        console.log("File created, starting upload...");

        const uploadResult = await startUpload([file]);
        console.log("Upload result:", uploadResult);
        if (!uploadResult || !uploadResult[0]?.url) {
          throw new Error("Échec du téléversement de l'image avec UploadThing");
        }

        const imageUrl = uploadResult[0].url;
        console.log("Image uploaded, URL:", imageUrl);

        router.push(`${returnTo}?imageUrl=${encodeURIComponent(imageUrl)}`);
      } catch (error) {
        console.error("Erreur avec UploadThing:", error);
        // Fallback : Utiliser l'ancienne méthode
        try {
          console.log("Falling back to direct POST...");
          const fallbackResponse = await fetch(returnTo, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: dataUrl }),
          });

          if (fallbackResponse.ok) {
            console.log("Fallback successful");
            router.push(returnTo);
          } else {
            console.error(
              "Erreur lors de l'envoi de l'image au serveur (fallback):",
              fallbackResponse.statusText
            );
          }
        } catch (fallbackError) {
          console.error(
            "Erreur lors de la requête POST (fallback):",
            fallbackError
          );
        }
      }
    }
  };

  return (
    <div className="flex h-full flex-col">
      <NavBar
        activeTool={activeTool}
        onChangeActiveTool={onChangeActiveTool}
        editor={editor}
      />
      <div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
        <SideBar
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ShapesSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FillColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokeColorSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <StrokWidthSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <OpacitySidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <TextSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FontSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <ImageSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <FilterSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <RemoveBgSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <DrawSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <SettingsSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <AiSidebar
          editor={editor}
          activeTool={activeTool}
          onChangeActiveTool={onChangeActiveTool}
        />
        <main className="bg-muted flex-1 overflow-auto relative flex flex-col">
          <Toolbar
            editor={editor}
            activeTool={activeTool}
            onChangeActiveTool={onChangeActiveTool}
            key={JSON.stringify(editor?.canvas.getActiveObject())}
          />
          <div
            className="flex-1 h-[calc(100%-124px)] bg-muted"
            ref={containerRef}
          >
            <canvas ref={canvasRef} />
          </div>
          <Footer editor={editor} />
          <button
            onClick={handleSaveImage}
            className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 mt-4"
          >
            Sauvegarder l'image
          </button>
        </main>
      </div>
    </div>
  );
};
