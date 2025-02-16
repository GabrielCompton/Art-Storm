from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import open3d as o3d
import os

app = Flask(__name__)
CORS(app)

# Ensure the static folder exists
STATIC_FOLDER = "static"
os.makedirs(STATIC_FOLDER, exist_ok=True)

@app.route('/api/process-depth', methods=['POST'])
def process_depth():
    file = request.files['depth_map']
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    # Read depth map
    depth_map = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_GRAYSCALE)

    if depth_map is None:
        return jsonify({'error': 'Failed to decode image. Ensure it is a valid depth map PNG.'}), 400

    # Convert depth map to 3D point cloud
    h, w = depth_map.shape
    points = []

    for y in range(h):
        for x in range(w):
            z = depth_map[y, x]
            if z > 0:
                points.append([x, y, z])

    if not points:
        return jsonify({'error': 'Depth map contains no valid depth information.'}), 400

    # Create Open3D point cloud
    pc = o3d.geometry.PointCloud()
    pc.points = o3d.utility.Vector3dVector(points)

    # Save to static folder
    output_filename = "output_point_cloud.ply"
    output_path = os.path.join(STATIC_FOLDER, output_filename)
    o3d.io.write_point_cloud(output_path, pc)

    return jsonify({'message': 'Point cloud generated successfully!',
                    'output': f'http://127.0.0.1:5000/static/{output_filename}'})

@app.route('/static/<path:filename>')
def download_file(filename):
    return send_from_directory(STATIC_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
