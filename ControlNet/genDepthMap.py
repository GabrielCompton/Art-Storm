import torch

def generate_depth_map(pipe, sketch):
    # Convert sketch to tensor format
    sketch_tensor = torch.tensor(sketch).permute(2, 0, 1).unsqueeze(0).to("cpu")

    # Generate depth map using ControlNet
    output = pipe(
        prompt="A 3D depth representation of this sketch",
        image=sketch_tensor
    )
    output.images[0].save("depth_map.png")
    return "depth_map.png"
