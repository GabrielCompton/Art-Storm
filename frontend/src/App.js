import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import * as THREE from 'three';

function PointCloudViewer({ plyUrl }) {
    console.log("Fetching PLY file from:", plyUrl);

    // Use Three.js PLYLoader to load the point cloud
    const geometry = useLoader(PLYLoader, plyUrl);

    const materialRef = useRef();

    useEffect(() => {
        if (geometry) {
            console.log("PLY Geometry Loaded:", geometry);

            // Ensure the geometry is centered for visibility
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
}


function App() {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pointCloudFile, setPointCloudFile] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

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
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Depth Map to 3D Point Cloud Viewer</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Processing...' : 'Upload and Process'}
            </button>
            {loading && <p>Processing depth map... Please wait.</p>}
            <h2>{message}</h2>

            {pointCloudFile && (
                <div style={{ width: "80vw", height: "80vh", margin: "auto" }}>
                    <Canvas camera={{ position: [0, 0, 50], fov: 75 }}>
                        <ambientLight intensity={1.0} />
                        <directionalLight position={[10, 10, 10]} />
                        <PointCloudViewer plyUrl={pointCloudFile} />
                        <OrbitControls />
                    </Canvas>
                </div>
            )}
        </div>
    );
}

export default App;
