import torch

def generate_depth_map(pipe, sketch):
    # Convert sketch to tensor format
    sketch_tensor = torch.tensor(sketch).permute(2, 0, 1).unsqueeze(0).to("cpu").float() / 255.0

    # Generate depth map using ControlNet
    with torch.no_grad():
        output = pipe(
            prompt="A 3D depth representation of this sketch",
            image=sketch_tensor
        )
    
    output.images[0].save("depth_map.png")
    
    # Clean up
    del sketch_tensor
    torch.cuda.empty_cache()  # Optional for CPU-only, but a good habit for memory management

    return "depth_map.png"
