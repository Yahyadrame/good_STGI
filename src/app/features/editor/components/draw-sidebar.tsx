"use client";
import { cn } from "@/lib/utils";
import {
  ActiveTool,
  Editor,
  FILL_COLORS,
  STROKE_COLOR,
  STROKE_WIDTH,
} from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface DrawSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const DrawSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: DrawSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR;
  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;

  const onChangeColor = (color: string) => {
    editor?.changeStrokeColor(color);
  };

  const onChangeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "draw" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Draw" description="Modify draw" />
      <ScrollArea>
        <div className="p-4 space-y-4">
          <Label>Strocke Width</Label>
          <Slider
            value={[widthValue]}
            onValueChange={(value) => onChangeWidth(value[0])}
          />
        </div>
        <div className="p-4 space-y-4">
          <ColorPickers value={colorValue} onChange={onChangeColor} />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
