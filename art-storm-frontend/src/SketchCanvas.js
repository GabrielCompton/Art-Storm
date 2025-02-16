import React, { useEffect, useRef, useState } from "react";
import { Canvas, PencilBrush, CircleBrush, PatternBrush, SprayBrush, Image } from "fabric";
import axios from 'axios';
import { Canvas as ThreeCanvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';

const PointCloudViewer = ({ plyUrl }) => {
    const geometry = useLoader(PLYLoader, plyUrl);
    const materialRef = useRef();

    useEffect(() => {
        if (geometry) {
            geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);
        }
    }, [geometry]);

    return geometry ? (
        <points>
            <bufferGeometry attach="geometry" {...geometry} />
            <pointsMaterial ref={materialRef} size={2} color="cyan" />
        </points>
    ) : (
        <p>Loading point cloud...</p>
    );
};

const SketchCanvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState("PencilBrush");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [pointCloudFile, setPointCloudFile] = useState(null);

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

  // Handle brush type change
  const handleBrushTypeChange = (event) => {
    const newBrush = event.target.value;
    setBrushType(newBrush);
    if (fabricCanvasRef.current) {
      updateBrush(fabricCanvasRef.current, newBrush, brushSize);
    }
  };

  // Update brush type
  const updateBrush = (canvas, brushName, size) => {
    let brush;
    switch (brushName) {
      case "PencilBrush":
        brush = new PencilBrush(canvas);
        break;
      case "CircleBrush":
        brush = new CircleBrush(canvas);
        break;
      case "SprayBrush":
        brush = new SprayBrush(canvas);
        brush.density = 20;
        break;
      case "PatternBrush":
        brush = new PatternBrush(canvas);
        brush.getPatternSrc = () => {
          const patternCanvas = document.createElement("canvas");
          patternCanvas.width = patternCanvas.height = 10;
          const ctx = patternCanvas.getContext("2d");
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, 10, 10);
          return patternCanvas;
        };
        break;
      default:
        brush = new PencilBrush(canvas);
    }
    brush.color = "white";
    brush.width = size;
    canvas.freeDrawingBrush = brush;
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
  
      // Convert base64 to Blob
      const byteString = atob(imageData.split(',')[1]);
      const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
  
      // Set the blob as the selected file
      const file = new File([blob], "drawing.png", { type: mimeString });
      setSelectedFile(file);
  
      // Call handleUpload to process the drawing
      handleUpload();
    }
  };
  // Upload image to backend
  const uploadImage = async (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);

    const response = await fetch('/depth_estimation/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Depth map:', data.depth_map);
        return data;
    } else {
        throw new Error('Error uploading image:', response.statusText);
    }
  };

  // Handle file change
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload to backend
  const handleUpload = () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setPointCloudFile(null);

    const formData = new FormData();
    formData.append('depth_map', selectedFile);

    axios.post('http://127.0.0.1:5000/api/process-depth', formData)
      .then(response => {
        setMessage(response.data.message);
        setPointCloudFile(response.data.output);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        setMessage('Error processing file.');
      })
      .finally(() => setLoading(false));
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

      {/*Brush Type Selector */}
      <div style={{ marginBottom: "15px" }}>
        <label style={{ color: "white", marginRight: "10px" }}>Select Brush:</label>
        <select value={brushType} onChange={handleBrushTypeChange}>
          <option value="PencilBrush">Pencil</option>
          <option value="CircleBrush">Circle</option>
          <option value="SprayBrush">Spray</option>
          <option value="PatternBrush">Pattern</option>
        </select>
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

      {/*File Upload */}
      <div style={{ marginTop: "10px" }}>
        <input type="file" accept="image/png" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ margin: "10px" }} disabled={loading}>
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </div>
      <h2>{message}</h2>

      {/* Display Processed Image */}
      {processedImageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ color: "white" }}>Processed Image:</h2>
          <img src={processedImageUrl} alt="Processed" style={{ border: "3px solid white" }} />
        </div>
      )}

      {/* Display Point Cloud */}
      {pointCloudFile && (
        <div style={{
          width: "80vw",
          height: "80vh",
          margin: "auto",
          border: "3px solid black",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.2)",
        }}>
          <ThreeCanvas camera={{ position: [0, 0, 750], fov: 75 }}>
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 10, 10]} />
            <PointCloudViewer plyUrl={pointCloudFile} />
            <OrbitControls />
          </ThreeCanvas>
        </div>
      )}
    </div>
  );
};

export default SketchCanvas;