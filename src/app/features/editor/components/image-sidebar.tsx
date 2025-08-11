"use client";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ActiveTool, Editor, fonts } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetImages } from "../../images/api/use-get-images";
import { AlertTriangle, Loader } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ImageSidebarProps) => {
  const onClose = () => {
    onChangeActiveTool("select");
  };

  const { data, isLoading, isSuccess, isError } = useGetImages();

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ToolSidebarHeader
        title="Images"
        description="Add image to your canvas"
      />
      <div className="p-4 border-b">
        <UploadButton
          appearance={{
            button: "w-full text-sm font-medium",
            allowedContent: "hidden",
          }}
          content={{
            button: "Upload Image",
          }}
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            editor?.addImage(res[0].url);
          }}
        />
      </div>
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-xm text-muted-foreground">
            Image failed to load. Please try again.
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data &&
              data.images.map((image: any) => (
                <button
                  key={image.id}
                  className="w-full relative h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  onClick={() => editor?.addImage(image.urls.regular)}
                >
                  <Image
                    fill
                    src={image.urls.small}
                    alt={image.alt_description}
                    className="object-cover"
                  />
                  <Link
                    href={image.links.html}
                    target="_blank"
                    className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline-offset-1 p-1 bg-black/50 text-left"
                  >
                    {image.user.name}
                  </Link>
                </button>
              ))}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
