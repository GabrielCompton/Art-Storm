import sys
import os
import cv2
import torch
import open3d as o3d
import gc
import multiprocessing

sys.path.append('/Users/aayushshrestha/Desktop/Hackathon/Art-Storm/ControlNet')

from loadControlNet import load_models
from preProcessImage import preprocess_image
from genDepthMap import generate_depth_map
from convertTo3D import depth_to_point_cloud

def limit_torch_threads():
    """Limit the number of threads used by PyTorch."""
    torch.set_num_threads(4)
    if hasattr(torch, 'set_num_interop_threads'):
        torch.set_num_interop_threads(4)

def main_pipeline(sketch_path):
    try:
        # Set multiprocessing start method
        multiprocessing.set_start_method('spawn', force=True)
        
        # Limit torch threads
        limit_torch_threads()
        
        # Force CPU
        device = "cpu"
        print(f"Loading models on {device}...")
        
        # Load models
        pipe = load_models().to(device)
        
        # Optimize settings
        print("Applying optimizations...")
        pipe.scheduler.set_timesteps(15)  # Reduced further from 20
        
        # Clear memory
        gc.collect()
        
        # Process image
        print("Preprocessing input image...")
        sketch = preprocess_image(sketch_path)
        
        print("Generating depth map...")
        depth_map_path = generate_depth_map(pipe, sketch)
        
        return depth_map_path

    except Exception as e:
        print(f"Error in pipeline: {str(e)}")
        raise
    finally:
        # Cleanup
        if 'pipe' in locals():
            del pipe
        gc.collect()

if __name__ == "__main__":
    sketch_path = "/Users/aayushshrestha/Desktop/images.jpeg"
    try:
        result_path = main_pipeline(sketch_path)
        print(f"Pipeline completed successfully. Output saved at: {result_path}")
    except Exception as e:
        print(f"Pipeline failed: {str(e)}")
        sys.exit(1)