"use client";

import { cn } from "@/lib/utils";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShapeTool } from "./shape-tool";
import { FaArrowDown, FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";
import { IoTriangle } from "react-icons/io5";
import { useState } from "react";

interface ShapeSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ShapesSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ShapeSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const [curvature, setCurvature] = useState(0.5);

  const addCurvedArrowWithOptions = (
    direction: "up" | "down" | "left" | "right"
  ) => {
    if (editor) {
      editor.addCurvedArrow(direction, curvature);
    }
  };

  return (
    <div
      className={cn(
        "bg-white relative border-r z-[40] w-full flex flex-col",
        activeTool === "shapes" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Formes"
        description="Ajouter des formes à votre canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <ShapeTool onClick={() => editor?.addCircle()} icon={FaCircle} />
            <ShapeTool
              onClick={() => editor?.addSoftRetangle()}
              icon={FaSquare}
            />
            <ShapeTool
              onClick={() => editor?.addRetangle()}
              icon={FaSquareFull}
            />
            <ShapeTool
              onClick={() => editor?.addTriangle()}
              icon={IoTriangle}
            />
            <ShapeTool
              onClick={() => addCurvedArrowWithOptions("down")}
              icon={FaArrowDown}
              iconClassName="rotate-0"
            />
            <ShapeTool
              onClick={() => addCurvedArrowWithOptions("up")}
              icon={FaArrowDown}
              iconClassName="rotate-180"
            />
            <ShapeTool
              onClick={() => addCurvedArrowWithOptions("left")}
              icon={FaArrowDown}
              iconClassName="rotate-90"
            />
            <ShapeTool
              onClick={() => addCurvedArrowWithOptions("right")}
              icon={FaArrowDown}
              iconClassName="rotate-270"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Courbure</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={curvature}
              onChange={(e) => setCurvature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </div>
  );
};