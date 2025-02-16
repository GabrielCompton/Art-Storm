import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Canvas, PencilBrush } from "fabric";

const SketchCanvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);

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
    fabricCanvas.freeDrawingBrush.width = brushSize;

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Handle brush size change
  const handleBrushSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setBrushSize(newSize);

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.freeDrawingBrush.width = newSize;
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
    }
  };

  // Save drawing to backend
  const saveDrawing = async () => {
    if (fabricCanvasRef.current) {
      const imageData = fabricCanvasRef.current.toDataURL("image/png"); // Convert to PNG

      try {
        const response = await fetch("http://127.0.0.1:5000/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: imageData }),
        });

        const result = await response.json();
        console.log("Server Response:", result);
        alert("Drawing saved successfully!");
      } catch (error) {
        console.error("Error saving drawing:", error);
        alert("Failed to save drawing.");
      }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Draw Something!</h2>

      {/* Brush Size Slider */}
      <div style={{ marginBottom: "10px" }}>
        <label>Brush Size: {brushSize}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
      </div>

      {/* Drawing Canvas with Outline */}
      <div
        style={{
          border: "3px solid black",
          display: "inline-block",
          marginTop: "10px",
          padding: "5px",
        }}
      >
        <canvas ref={canvasRef}></canvas>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={clearCanvas} style={{ margin: "10px" }}>Clear Canvas</button>
        <button onClick={saveDrawing} style={{ margin: "10px" }}>Save Drawing</button>
      </div>
    </div>
  );
};

export default SketchCanvas;
