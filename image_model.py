import torch
from diffusers import FluxPipeline
from diffusers import DiffusionPipeline
import os

current_file_path = os.path.dirname(os.path.abspath(__file__))
pipe = DiffusionPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-dev", torch_dtype=torch.float32
).to("cpu")
pipe.enable_model_cpu_offload()

prompt = "a less noise 8-bit wizard masterpiece music, inspired by Hogwarts,magic, Harry Potter,Wizard,with personality is 'entp' and gender is 'female',back ground is 'Leiden'."
image = pipe(
    prompt,
    height=75,
    width=75,
    guidance_scale=3.5,
    num_inference_steps=25,
    max_sequence_length=512,
    generator=torch.Generator("cpu").manual_seed(0)
).images[0]
image.save("1.png")
print('finish saved.')