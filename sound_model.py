from transformers import pipeline, AutoProcessor, MusicgenForConditionalGeneration
import scipy.io.wavfile
import os
import scipy

current_file_path = os.path.dirname(os.path.abspath(__file__))

processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")

inputs = processor(
    text=["a less noise 8-bit wizard masterpiece music, inspired by Hogwarts,magic, Harry Potter,Wizard,with personality is 'entp' and gender is 'female',back ground is 'Leiden'."],
    padding=True,
    return_tensors="pt",
)

audio_values = model.generate(**inputs, max_new_tokens=1536)
sampling_rate = model.config.audio_encoder.sampling_rate
scipy.io.wavfile.write("1.wav", rate=sampling_rate, data=audio_values[0, 0].numpy())

print("Audio saved.")