"use client";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Tooltip } from "@/components/ui/tooltip";
import { Pencil } from "lucide-react";

export const CanvasContainer = () => {
  const canvasRef = useRef(null);
  const [canvasData, setCanvasData] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(true);

  const canvasWidth = 1500;
  const canvasHeight = 910;

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: drawingEnabled,
      defaultCursor: true,
    });

    fabric.Object.prototype.set({
      borderColor: "red",
      cornerColor: "darkblue",
      cornerStrokeColor: "darkblue",
      cornerSize: 9,
      transparentCorners: false,
    });

    newCanvas.freeDrawingBrush.color = "black";
    newCanvas.freeDrawingBrush.width = 5;
    newCanvas.setWidth(canvasWidth);
    newCanvas.setHeight(canvasHeight);

    newCanvas.on("mouse:wheel", function (opt) {
      let mouseDistanceTravelled = opt.e.deltaY;
      let currentZoomLevel = newCanvas.getZoom();
      currentZoomLevel = currentZoomLevel * 0.999 ** mouseDistanceTravelled;

      if (currentZoomLevel > 20) currentZoomLevel = 20;
      if (currentZoomLevel < 0.01) currentZoomLevel = 0.01;
      newCanvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        currentZoomLevel
      );
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    setCanvasData(newCanvas);

    return () => {
      newCanvas.dispose();
    };
  }, []);

  const changeDrawingMode = () => {
    if (canvasData?.isDrawingMode === true) {
      canvasData.isDrawingMode = false;
      setDrawingEnabled(false);
      canvasData.defaultCursor = "default";
    } else {
      canvasData.isDrawingMode = true;
      setDrawingEnabled(true);
      canvasData.defaultCursor = "crosshair";
    }
    setDrawingEnabled(!drawingEnabled);
  };

  const changePanMode = () => {};

  const undo = () => {};

  const redo = () => {};

  const clearCanvas = () => {};

  const save = () => {};

  const load = () => {};

  const saveAsPNG = () => {};

  const changeColor = (color) => {};

  const changeBrush = (brush) => {};

  const addShape = (shape) => {};

  const addCustomImage = () => {};

  return (
    <div className="outer-container">
      <div className="canvas-functions">
        {/* Task 2 (tooltip) */}
        {/* <Tooltip id="my-tooltip" /> */}
        <div className="container">
          <div className="row">
            {/* Task 2 (ui within the render method) */}
            <div className="col column-height">
              <Pencil
                onClick={() => changeDrawingMode()}
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Drawing mode"
                style={{
                  fontSize: "40px",
                  color: drawingEnabled ? "darkblue" : "gray",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Task 1 (display the canvas element) */}
      <div
        style={{ border: "2px solid black", display: "inline-block" }}
        className="canvas-container"
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
