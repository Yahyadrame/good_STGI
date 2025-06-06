import { cn } from "@/lib/utils";
import { ActiveTool, Editor, FILL_COLORS } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPickers } from "./color-pikers";

interface FillColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FillColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FillColorSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onChangeColor = (color: string) => {
    editor?.changeFillColor(color);
  };

  const value = editor?.getActiveFillColor() || FILL_COLORS;

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "fill" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Fill Color"
        description="Add fill color to your canvas"
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
