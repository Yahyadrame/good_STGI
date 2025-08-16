"use client";

import { Folder, FileText, List } from "lucide-react";
import { SideBartItem } from "./Sidebar-item";
import Link from "next/link";
import { ActiveTool } from "../../types";

interface NavigationSidebarProps {
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
  folders?: any[];
  instructions?: any[];
  steps?: any[];
  folderId?: string | string[];
  instructionId?: string | string[];
}

export const NavigationSidebar = ({
  activeTool,
  onChangeActiveTool,
  folders,
  instructions,
  steps,
  folderId,
  instructionId,
}: NavigationSidebarProps) => {
  return (
    <aside className="bg-white w-[250px] h-full border-r shadow-sm overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
        <ul className="space-y-2">
          <Link href="/">
            <SideBartItem
              icon={Folder}
              label="Dossiers"
              isActive={activeTool === "folders"}
              onClick={() => onChangeActiveTool("folders")}
            />
          </Link>
          {folders && (
            <div className="pl-4 space-y-1">
              {folders.map((folder) => (
                <Link key={folder.id} href={`/editor/${folder.id}`}>
                  <SideBartItem
                    icon={Folder}
                    label={folder.name}
                    isActive={folderId === folder.id.toString()}
                  />
                </Link>
              ))}
            </div>
          )}
          {folderId && (
            <Link href={`/editor/${folderId}`}>
              <SideBartItem
                icon={FileText}
                label="Instructions"
                isActive={activeTool === "instructions"}
                onClick={() => onChangeActiveTool("instructions")}
              />
            </Link>
          )}
          {instructions && folderId && (
            <div className="pl-4 space-y-1">
              {instructions.map((instruction) => (
                <Link
                  key={instruction.id}
                  href={`/editor/${folderId}/${instruction.id}`}
                >
                  <SideBartItem
                    icon={FileText}
                    label={instruction.title}
                    isActive={instructionId === instruction.id.toString()}
                  />
                </Link>
              ))}
            </div>
          )}
          {instructionId && (
            <Link href={`/editor/${folderId}/${instructionId}`}>
              <SideBartItem
                icon={List}
                label="Étapes"
                isActive={activeTool === "steps"}
                onClick={() => onChangeActiveTool("steps")}
              />
            </Link>
          )}
          {steps && instructionId && (
            <div className="pl-4 space-y-1">
              {steps.map((step, index) => (
                <Link
                  key={step.id}
                  href={`/editor/${folderId}/${instructionId}/edit/${step.id}`}
                >
                  <SideBartItem
                    icon={List}
                    label={`Étape ${index + 1}`}
                    isActive={false}
                  />
                </Link>
              ))}
            </div>
          )}
        </ul>
      </div>
    </aside>
  );
};
