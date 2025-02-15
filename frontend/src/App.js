import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/api/message') // Flask API Endpoint
            .then(response => {
                setMessage(response.data.message);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>React + Flask Communication</h1>
            <h2>{message}</h2>
        </div>
    );
}

export default App;
