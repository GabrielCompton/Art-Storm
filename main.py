from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import open3d as o3d
import os
import logging
from depth_estimation import app as depth_estimation_app

app = Flask(__name__)
CORS(app)

# Ensure the static folder exists
STATIC_FOLDER = "static"
os.makedirs(STATIC_FOLDER, exist_ok=True)

# Register the routes from depth_estimation
app.add_url_rule('/depth_estimation/upload', view_func=depth_estimation_app.view_functions['upload_image'], methods=['POST'])

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/api/process-depth', methods=['POST'])
def process_depth():
    try:
        file = request.files['depth_map']
        if not file:
            logging.error("No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400

        # Read depth map
        depth_map = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_UNCHANGED)
        logging.debug(f"Depth map shape: {depth_map.shape}, dtype: {depth_map.dtype}")

        if depth_map is None:
            logging.error("Failed to decode image. Ensure it is a valid depth map PNG.")
            return jsonify({'error': 'Failed to decode image. Ensure it is a valid depth map PNG.'}), 400

        # Convert to single-channel image if necessary
        if len(depth_map.shape) == 3:
            depth_map = cv2.cvtColor(depth_map, cv2.COLOR_BGR2GRAY)
            logging.debug(f"Converted depth map shape: {depth_map.shape}, dtype: {depth_map.dtype}")

        # Ensure depth map is a single channel image
        if len(depth_map.shape) != 2:
            logging.error("Depth map is not a single channel image.")
            return jsonify({'error': 'Depth map is not a single channel image.'}), 400

        # Normalize depth values to range [0, 1]
        depth_map = depth_map.astype(np.float32) / 255.0
        logging.debug(f"Normalized depth map: min={depth_map.min()}, max={depth_map.max()}")

        # Scale depth values to a reasonable range
        depth_map *= 1000  # Adjust this scaling factor as needed
        logging.debug(f"Scaled depth map: min={depth_map.min()}, max={depth_map.max()}")

        # Flip the depth map vertically to correct orientation
        depth_map = cv2.flip(depth_map, 0)  # 0 = Flip vertically

        # Convert depth map to 3D point cloud
        h, w = depth_map.shape
        fx, fy = w / 2.0, h / 2.0  # Focal lengths (adjust as needed)
        cx, cy = w / 2.0, h / 2.0  # Principal points (center of the image)

        points = []
        for y in range(h):
            for x in range(w):
                z = depth_map[y, x]
                if z > 0:
                    X = (x - cx) * z / fx
                    Y = (y - cy) * z / fy
                    points.append([X, Y, z])

        if not points:
            logging.error("Depth map contains no valid depth information.")
            return jsonify({'error': 'Depth map contains no valid depth information.'}), 400

        # Create Open3D point cloud
        pc = o3d.geometry.PointCloud()
        pc.points = o3d.utility.Vector3dVector(points)

        # Save to static folder
        output_filename = "output_point_cloud.ply"
        output_path = os.path.join(STATIC_FOLDER, output_filename)
        o3d.io.write_point_cloud(output_path, pc)

        logging.info("Point cloud generated successfully!")
        return jsonify({'message': 'Point cloud generated successfully!',
                        'output': f'http://127.0.0.1:5000/static/{output_filename}'})
    except Exception as e:
        logging.error(f"Error processing file: {e}")
        return jsonify({'error': 'Error processing file.'}), 500

@app.route('/static/<path:filename>')
def download_file(filename):
    return send_from_directory(STATIC_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)