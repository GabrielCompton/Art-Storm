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
    fabricCanvas.backgroundColor = "black";
    fabricCanvas.renderAll();
    fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = "white";
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
      fabricCanvasRef.current.backgroundColor = "black";
    }
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = "black";
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
    <div style={{ textAlign: "center", backgroundColor: "#DC143C", minHeight: "100vh", padding: "20px" }}>
      {/*Title Header */}
      <h1 style={{ color: "white", fontSize: "50px", marginBottom: "5px" }}>
        CrimsonCode 2025
      </h1>

      {/*Subtext */}
      <h3 style={{ color: "white", fontSize: "22px", marginBottom: "20px" }}>
        Crimson Cowboys - Art Storm Sketch App
      </h3>

      {/*Draw Something Header */}
      <h2 style={{ color: "white", marginBottom: "15px" }}>Draw Something!</h2>

      {/*Brush Size Slider */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ color: "white" }}>Brush Size: {brushSize}px</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={handleBrushSizeChange}
        />
      </div>

      {/*Drawing Canvas with Black Background */}
      <div
        style={{
          border: "3px solid white",
          display: "inline-block",
          marginTop: "10px",
          padding: "5px",
          backgroundColor: "black",
        }}
      >
        <canvas ref={canvasRef}></canvas>
      </div>

      {/*Action Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={clearCanvas} style={{ margin: "10px" }}>Clear Canvas</button>
        <button onClick={saveDrawing} style={{ margin: "10px" }}>Process Drawing</button>
      </div>
    </div>
  );
};

export default SketchCanvas;
