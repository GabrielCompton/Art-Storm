import torch
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel

def load_models():
    # Load the ControlNet model for depth estimation
    controlnet = ControlNetModel.from_pretrained(
        "lllyasviel/sd-controlnet-depth", 
        torch_dtype=torch.float32  # Use float32 for CPU compatibility
    )

    # Load Stable Diffusion model
    pipe = StableDiffusionControlNetPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        controlnet=controlnet,
        torch_dtype=torch.float32  # Use float32 for CPU compatibility
    ).to("cpu")  # Ensure it's on CPU
    
    return pipe

