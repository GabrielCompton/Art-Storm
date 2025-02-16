import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";
import { Canvas, PencilBrush} from "fabric";

const SketchCanvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Fabric.js requires an `id` or `querySelector`
    const fabricCanvas = new Canvas(canvasRef.current);

    // Store reference
    fabricCanvasRef.current = fabricCanvas;

    // Set canvas size
    fabricCanvas.setWidth(800);
    fabricCanvas.setHeight(500);

    // Enable drawing mode
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = "black";
    fabricCanvas.freeDrawingBrush.width = 5;

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Draw Something!</h2>
      <canvas ref={canvasRef} id="drawingCanvas" width="800" height="500"></canvas>
    </div>
  );
};

export default SketchCanvas;
