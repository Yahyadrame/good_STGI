import { cn } from "@/lib/utils";
import { ActiveTool, Editor, fonts } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface FontSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const FontSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: FontSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };
  const valueFontFamily = editor?.getActiveFontFamily();
  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "font" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader title="Font" description="Add text to your canvas" />
      <ScrollArea>
        <div className="p-4 space-y-1">
          {fonts.map((font, index) => (
            <Button
              key={`${font}-${index}`}
              variant="secondary"
              size="lg"
              className={cn(
                valueFontFamily === font && "border-2 border-blue-500",
                "w-full h-16 justify-start text-left font-${font}"
              )}
              style={{
                fontFamily: font,
                fontSize: "16px",
                padding: "8px 16px",
              }}
              onClick={() => editor?.changeFontFamily(font)}
            >
              {font}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
