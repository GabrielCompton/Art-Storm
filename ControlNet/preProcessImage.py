import cv2
import numpy as np

def preprocess_image(image_path):
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)  # Load as grayscale
    image = cv2.resize(image, (512, 512))  # Resize for model compatibility

    # Normalize image to range [0, 1]
    image = image.astype(np.float32) / 255.0

    # ControlNet requires 3 channels, so we stack it to create a 3-channel image
    image = np.stack([image] * 3, axis=-1)

    return image
