import { cn } from "@/lib/utils";
import {
  ActiveTool,
  Editor,
  STROKE_DASH_ARRAY,
  STROKE_WIDTH,
} from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface StrokWidthSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const StrokWidthSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: StrokWidthSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeWidth = (value: number) => {
    editor?.changeStrokeWidth(value);
  };

  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);
  };

  const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const strokeTypeValue =
    editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY;

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "stroke-width" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Stroke Width"
        description="Modify stroke width of your canvas"
      />
      <ScrollArea>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke Width</Label>
          <Slider
            value={[widthValue]}
            onValueChange={(values) => onChangeWidth(values[0])}
          />
        </div>
        <div className="p-4 space-y-4 border-b">
          <Label className="text-sm">Stroke type</Label>
          <Button
            onClick={() => onChangeStrokeType([])}
            variant="secondary"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(strokeTypeValue) === `[]` &&
                "border border-blue-500"
            )}
            size="lg"
            style={{ padding: "8px 16px" }}
          >
            <div className="w-full border-black rounded-full border-4" />
          </Button>
          <Button
            onClick={() => onChangeStrokeType([5, 5])}
            variant="secondary"
            className={cn(
              "w-full h-16 justify-start text-left",
              JSON.stringify(strokeTypeValue) === `[5, 5]` &&
                "border border-blue-500"
            )}
            size="lg"
            style={{ padding: "8px 16px" }}
          >
            <div className="w-full border-black rounded-full border-4 border-dashed" />
          </Button>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
