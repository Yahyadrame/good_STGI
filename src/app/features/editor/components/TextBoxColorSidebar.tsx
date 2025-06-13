"use client";

import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TextBoxColorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const TextBoxColorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TextBoxColorSidebarProps) => {
  const onClose = () => onChangeActiveTool("select");

  const changeBackgroundColor = (color: string) => {
    if (!editor) {
      console.log("Editor is undefined");
      return;
    }
    editor.changeBackgroundColor(color);
    console.log("Color change triggered:", color);
  };

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "text-box-color" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Text Box Color"
        description="Change the background color of the text box"
      />
      <ScrollArea>
        <div className="p-4">
          <input
            type="color"
            onChange={(e) => changeBackgroundColor(e.target.value)}
            className="w-full h-10 border rounded"
            defaultValue="#ffffff"
          />
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
