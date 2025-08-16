/*"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ActiveTool, Editor } from "../../types";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEditor } from "../hooks/use-editor";
import GIF from "gif.js/dist/gif";
import { fabric } from "fabric";

interface VideoEditorSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const VideoEditorSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: VideoEditorSidebarProps) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [clips, setClips] = useState<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected video file:", file.name, file.type, file.size);
      setVideoFile(file);
      if (videoRef.current) {
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
        videoRef.current.load();
        videoRef.current.onloadeddata = () => {
          console.log("Video loaded, duration:", videoRef.current?.duration);
          videoRef.current
            ?.play()
            .then(() => console.log("Video playback started"))
            .catch((err) => console.error("Play error:", err));
        };
        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e);
          if (e.target instanceof HTMLVideoElement) {
            console.error("Error details:", e.target.error?.message);
          }
        };
        console.log("Video URL set:", url);
      }
    }
  };

  const cutVideo = useCallback(async () => {
    if (!videoRef.current || !videoFile || typeof window === "undefined") return;

    if (videoRef.current.readyState < 2) {
      console.error("Video not ready, current state:", videoRef.current.readyState);
      await videoRef.current.play().catch((err) => console.error("Play error:", err));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const stream = videoRef.current.captureStream();
    if (!stream.getTracks().length) {
      console.error("No video or audio tracks available");
      return;
    }

    const chunk = await new Promise<Blob>((resolve, reject) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp8",
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      recorder.onerror = (e) => reject(new Error("Recording failed: " + e.error));
      recorder.start();
      const duration = Math.max(1, endTime - startTime);
      console.log("Recording for", duration, "seconds");
      setTimeout(() => recorder.stop(), duration * 1000);
    }).catch((err) => {
      console.error("Recording error:", err);
      return null;
    });

    if (chunk) setClips((prev) => [...prev, chunk]);
  }, [videoFile, startTime, endTime]);

  const joinClips = useCallback(async () => {
    if (clips.length < 1 || !editor?.canvas) return;

    const blob = new Blob(clips, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    fabric.Image.fromURL(url, (img) => {
      editor.canvas.add(img);
      editor.canvas.renderAll();
    }, { crossOrigin: "anonymous" });
  }, [clips, editor]);

  const convertToGIF = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !editor?.canvas) return;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 320,
      height: 240,
    });

    const duration = endTime - startTime;
    const frameRate = 15;
    const totalFrames = Math.min(duration * frameRate, 30);

    if (videoRef.current.readyState < 2) {
      console.error("Video not ready for GIF conversion");
      await videoRef.current.play().catch((err) => console.error("Play error:", err));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    for (let i = 0; i < totalFrames; i++) {
      const time = startTime + i / frameRate;
      videoRef.current.currentTime = time;
      await new Promise((resolve) => setTimeout(resolve, 50));
      const ctx = canvasRef.current!.getContext("2d");
      if (ctx) ctx.drawImage(videoRef.current, 0, 0);
      gif.addFrame(canvasRef.current, { delay: 1000 / frameRate });
    }

    gif.on("finished", (blob) => {
      const url = URL.createObjectURL(blob);
      fabric.Image.fromURL(url, (img) => {
        editor.canvas.add(img);
        editor.canvas.renderAll();
      }, { crossOrigin: "anonymous" });
    });

    gif.render();
  }, [startTime, endTime, editor]);

  return (
    <aside
      className={cn(
        "bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "video-editor" ? "visible" : "hidden"
      )}
    >
      {!videoFile && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Please upload a video file
          </p>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>
      )}
      <ToolSidebarHeader
        title="Video Editor"
        description="Cut, join, and convert videos to GIF"
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {videoFile && (
            <>
              <video
                ref={videoRef}
                controls
                className="w-full mb-4"
                onError={(e) => console.error("Video element error:", e)}
              />
              <canvas
                ref={canvasRef}
                width="320"
                height="240"
                style={{ display: "none" }}
              />
              <div className="space-y-2">
                <label>
                  Start Time (s):
                  <input
                    type="number"
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-full p-1 border rounded"
                    min="0"
                  />
                </label>
                <label>
                  End Time (s):
                  <input
                    type="number"
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    className="w-full p-1 border rounded"
                    min={startTime + 1}
                  />
                </label>
                <Button onClick={cutVideo} className="w-full">
                  Cut Video
                </Button>
                <Button
                  onClick={joinClips}
                  className="w-full"
                  disabled={clips.length < 1}
                >
                  Join Clips
                </Button>
                <Button onClick={convertToGIF} className="w-full">
                  Convert to GIF
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};*/