# Voz en off con Piper (local, gratis). La llama make-exercise.mjs desde videos/<slug>/:
#   python plantilla/piper-tts.py audio_request.json audio_engine_meta.json
# Lee { voice, speed, lines: [{id, text}] } y escribe assets/voice/<id>.wav + el meta que usa build-index
# (mismo formato que el motor de Kokoro: voices[{id, path, duration_s, words}]).
# Modelos en plantilla/voces-piper/<voice>.onnx (+ .onnx.json). Daniela (es_AR): CC BY-SA 4.0, ver README.
import json, os, sys, wave
from piper import PiperVoice, SynthesisConfig

HERE = os.path.dirname(os.path.abspath(__file__))
req_path, out_path = sys.argv[1], sys.argv[2]
req = json.load(open(req_path, encoding="utf-8"))
model = os.path.join(HERE, "voces-piper", req["voice"] + ".onnx")
if not os.path.exists(model):
    sys.exit(f"falta el modelo {model} (ver plantilla/README.md, sección Voz)")
voice = PiperVoice.load(model)
cfg = SynthesisConfig(length_scale=1.0 / (req.get("speed") or 1.0))
os.makedirs("assets/voice", exist_ok=True)
voices, total = [], 0.0
for line in req["lines"]:
    path = f"assets/voice/{line['id']}.wav"
    with wave.open(path, "wb") as w:
        voice.synthesize_wav(line["text"], w, syn_config=cfg)
    with wave.open(path, "rb") as w:
        dur = round(w.getnframes() / w.getframerate(), 3)
    voices.append({"id": line["id"], "path": path, "duration_s": dur, "words": []})
    total += dur
    print(f"  {line['id']}: {dur:.2f} s")
json.dump({"tts_provider": "piper", "voice_id": req["voice"], "bgm": None, "voices": voices, "sfx": [],
           "total_duration_s": round(total, 3)}, open(out_path, "w", encoding="utf-8"), indent=2)
