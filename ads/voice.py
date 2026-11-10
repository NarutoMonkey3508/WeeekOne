# Generates the voiceover lines in launch-ad/voice/ with Kokoro (open-source neural TTS).
# Usage: <venv>/bin/python voice.py <folder with kokoro-v1.0.onnx and voices-v1.0.bin> [ad folder, default launch-ad]
import json, sys, os, soundfile as sf
from kokoro_onnx import Kokoro
here = os.path.dirname(os.path.abspath(__file__)); vdir = os.path.join(here, sys.argv[2] if len(sys.argv) > 2 else 'launch-ad', 'voice')
cfg = json.load(open(os.path.join(vdir, 'script.json')))
k = Kokoro(os.path.join(sys.argv[1], 'kokoro-v1.0.onnx'), os.path.join(sys.argv[1], 'voices-v1.0.bin'))
durs = {}
for line in cfg['lines']:
    audio, sr = k.create(line['text'], voice=cfg['voice'], speed=cfg['speed'], lang='en-us')
    sf.write(os.path.join(vdir, line['id'] + '.wav'), audio, sr)
    durs[line['id']] = round(len(audio) / sr, 3)
json.dump(durs, open(os.path.join(vdir, 'durations.json'), 'w'), indent=2)
print(durs, 'total', round(sum(durs.values()), 2))
