import sys
import os
import cv2
import torch
import open3d as o3d

# Now you can import the modules
from loadControlNet import load_models
from preProcessImage import preprocess_image
from genDepthMap import generate_depth_map
from convertTo3D import depth_to_point_cloud



def main_pipeline(sketch_path):
    # Step 1: Load models
    pipe = load_models().to("cpu")

    # Step 2: Preprocess input image (sketch)
    sketch = preprocess_image(sketch_path)

    # Step 3: Generate depth map
    depth_map_path = generate_depth_map(pipe, sketch)

    # Step 4: Convert depth map to point cloud
    point_cloud_path = depth_to_point_cloud(depth_map_path)

    print(f"Point cloud saved at: {point_cloud_path}")

# Example usage (You can pass your sketch path here)
if __name__ == "__main__":
    sketch_path = "/Users/axey2/Downloads/testImage.jpeg"  # Replace with your sketch image path
    main_pipeline(sketch_path)
