# pip install transformers
from transformers import AutoModelForCausalLM, AutoTokenizer
checkpoint = "HuggingFaceTB/SmolLM2-135M"
device = "cuda" # for GPU usage or "cpu" for CPU usage
tokenizer = AutoTokenizer.from_pretrained(checkpoint)
# for multiple GPUs install accelerate and do `model = AutoModelForCausalLM.from_pretrained(checkpoint, device_map="auto")`
model = AutoModelForCausalLM.from_pretrained(checkpoint).to(device)

background = (
    "In a mystical land filled with enchanted forests and ancient ruins, "
    "there lived a powerful wizard named Eldrin. Eldrin was tasked with protecting "
    "his realm from the forces of darkness."
)

input_text = background + " One day, Eldrin discovered a mysterious scroll that foretold..."
generated_text = input_text

for _ in range(5):
    truncated_text = generated_text[-500:]
    inputs = tokenizer.encode(truncated_text, return_tensors="pt").to(device)
    outputs = model.generate(
        inputs,
        max_new_tokens=100,
        temperature=0.7,
        top_k=20,
        top_p=0.85,
        repetition_penalty=2.2,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )
    new_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    new_generated = new_text[len(truncated_text):].strip()
    if new_generated:
        generated_text = background + " " + new_generated

print("Final Generated Text:")
print(generated_text)

