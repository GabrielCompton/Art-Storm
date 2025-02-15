import open3d as o3d
import numpy as np
import cv2

def depth_to_point_cloud(depth_map_path):
    # Load depth map (grayscale image)
    depth_image = cv2.imread(depth_map_path, cv2.IMREAD_GRAYSCALE)

    # Convert depth image to point cloud
    height, width = depth_image.shape
    fx, fy = width / 2, height / 2  # Focal lengths (can be adjusted)

    # Create 3D point cloud
    points = []
    for y in range(height):
        for x in range(width):
            z = depth_image[y, x] / 255.0  # Normalize depth values
            points.append([(x - width / 2) / fx, (y - height / 2) / fy, z])

    # Convert to Open3D point cloud object
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(np.array(points))

    # Save point cloud to file
    o3d.io.write_point_cloud("output_point_cloud.ply", pcd)
    return "output_point_cloud.ply"
