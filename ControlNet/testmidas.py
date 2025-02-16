import cv2
import torch
import matplotlib.pyplot as plt
import numpy as np

# Download the MiDaS model
midas = torch.hub.load('intel-isl/MiDaS', 'MiDaS_small')
midas.to('cpu')
midas.eval()

# Input transformation pipeline
transforms = torch.hub.load('intel-isl/MiDaS', 'transforms')
transform = transforms.small_transform

# Hook into OpenCV
cap = cv2.VideoCapture(0)
while True:
    ret, frame = cap.read()
    cv2.imshow('Press Space to Capture Image', frame)

    # Wait for spacebar to capture an image
    key = cv2.waitKey(1) & 0xFF
    if key == ord(' '):  # Spacebar to capture image
        # Transform input for MiDaS
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        imgbatch = transform(img).to('cpu')

        # Make a prediction
        with torch.no_grad():
            prediction = midas(imgbatch)
            prediction = torch.nn.functional.interpolate(
                prediction.unsqueeze(1),
                size=img.shape[:2],
                mode='bicubic',
                align_corners=False
            ).squeeze()

            output = prediction.cpu().numpy()

        # Create 3D point cloud visualization
        height, width = output.shape
        x = np.arange(0, width)
        y = np.arange(0, height)
        x, y = np.meshgrid(x, y)

        # Flatten the mesh grid and depth values
        x = x.flatten()
        y = y.flatten()
        z = output.flatten()

        # Plot the 3D point cloud
        fig = plt.figure()
        ax = fig.add_subplot(111, projection='3d')

        ax.scatter(x, y, z, c=z, cmap='plasma', s=2)
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Depth')
        ax.set_title('3D Point Cloud from Depth Map')

        # Show the plot
        plt.show()

        # Wait for user to close the plot window
        plt.pause(1)

    # Exit on pressing 'q'
    if key == ord('q'):
        cap.release()
        cv2.destroyAllWindows()
        break

cv2.destroyAllWindows()
