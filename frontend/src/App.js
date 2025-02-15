import React, { useState } from 'react';
import axios from 'axios';

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
            <h1>Depth Map to Point Cloud</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Processing...' : 'Upload and Process'}
            </button>
            {loading && <p>Processing depth map... Please wait.</p>}
            <h2>{message}</h2>
            {pointCloudFile && (
                <div>
                    <p>Download your generated point cloud:</p>
                    <a href={`http://127.0.0.1:5000/static/${pointCloudFile}`} download>
                        <button>Download Point Cloud (.ply)</button>
                    </a>
                </div>
            )}
        </div>
    );
}

export default App;
