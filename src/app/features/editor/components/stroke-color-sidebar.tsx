"use client";
import { cn } from "@/lib/utils";
import { ActiveTool, Editor, STROKE_COLOR } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";

interface StrokColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokeColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokColorSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeColor = (color: string) => {
    editor?.changeStrokeColor(color);
  };

  const value = editor?.getActiveFillColor() || STROKE_COLOR;

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "stroke-color" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Stroke Color"
        description="Add stroke color to your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          <ColorPickers value={value} onChange={onChangeColor} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
