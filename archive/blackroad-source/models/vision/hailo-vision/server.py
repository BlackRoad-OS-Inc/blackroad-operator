#!/usr/bin/env python3
"""BlackRoad Hailo Vision — YOLOv5 object detection on Hailo-8"""
import time, json, subprocess, base64, tempfile, os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

app = FastAPI(title="BlackRoad Hailo Vision")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OCTAVIA = "192.168.4.100"
YOLO_HEF = "/mnt/nvme/models/yolov5s.hef"
COCO_LABELS = ["person","bicycle","car","motorcycle","airplane","bus","train","truck","boat",
    "traffic light","fire hydrant","stop sign","parking meter","bench","bird","cat","dog",
    "horse","sheep","cow","elephant","bear","zebra","giraffe","backpack","umbrella","handbag",
    "tie","suitcase","frisbee","skis","snowboard","sports ball","kite","baseball bat",
    "baseball glove","skateboard","surfboard","tennis racket","bottle","wine glass","cup",
    "fork","knife","spoon","bowl","banana","apple","sandwich","orange","broccoli","carrot",
    "hot dog","pizza","donut","cake","chair","couch","potted plant","bed","dining table",
    "toilet","tv","laptop","mouse","remote","keyboard","cell phone","microwave","oven",
    "toaster","sink","refrigerator","book","clock","vase","scissors","teddy bear",
    "hair drier","toothbrush"]

def run_on_octavia(cmd, timeout=30):
    r = subprocess.run(["ssh", "-o", "ConnectTimeout=3", f"pi@{OCTAVIA}", cmd],
                       capture_output=True, text=True, timeout=timeout)
    return r.stdout, r.stderr, r.returncode

@app.get("/health")
def health():
    try:
        out, err, rc = run_on_octavia("hailortcli fw-control identify 2>&1 | head -5")
        hailo_ok = "Hailo-8" in out
        models_out, _, _ = run_on_octavia(f"ls -la {YOLO_HEF} 2>/dev/null")
        return {
            "status": "online" if hailo_ok else "degraded",
            "device": "Hailo-8",
            "model": "yolov5s.hef",
            "model_exists": YOLO_HEF in models_out,
            "info": out.strip()
        }
    except:
        return {"status": "offline", "device": "Hailo-8"}

@app.post("/detect")
async def detect(image: UploadFile = File(...)):
    t0 = time.time()
    img_bytes = await image.read()

    # Save image to Octavia
    b64 = base64.b64encode(img_bytes).decode()
    run_on_octavia(f"echo '{b64}' | base64 -d > /tmp/detect_input.jpg")

    # Run inference on Octavia using Hailo-8 Python API (4.23.0)
    # Output format: list[batch][class_id] = ndarray(N, 5) where cols = [y_min, x_min, y_max, x_max, score]
    script = f"""python3 -c "
import numpy as np
from hailo_platform import HEF, VDevice, InferVStreams, InputVStreamParams, OutputVStreamParams, FormatType
from PIL import Image
import json, time

img = Image.open('/tmp/detect_input.jpg').convert('RGB').resize((640, 640))
arr = np.expand_dims(np.array(img, dtype=np.uint8), 0)

hef = HEF('{YOLO_HEF}')
vdevice = VDevice()
net_group = vdevice.configure(hef)[0]
info_in = net_group.get_input_vstream_infos()[0]
inp_params = InputVStreamParams.make(net_group, format_type=FormatType.UINT8)
out_params = OutputVStreamParams.make(net_group, format_type=FormatType.FLOAT32)

t = time.time()
net_group_params = net_group.create_params()
with net_group.activate(net_group_params):
    with InferVStreams(net_group, inp_params, out_params) as pipeline:
        results = pipeline.infer({{info_in.name: arr}})
ms = int((time.time()-t)*1000)

# NMS output: list[batch][class_id] = ndarray(N, 5) [y1,x1,y2,x2,score]
output = list(results.values())[0]
batch0 = output[0]  # 80 classes
objects = []
for cls_id, dets in enumerate(batch0):
    for det in dets:
        score = float(det[4])
        if score > 0.3:
            objects.append({{'label': cls_id, 'confidence': round(score, 3), 'bbox': [round(float(d), 4) for d in det[:4]]}})

objects.sort(key=lambda x: x['confidence'], reverse=True)
print(json.dumps({{'objects': objects[:20], 'inference_ms': ms}}))
" 2>&1 || echo '{{"objects":[],"inference_ms":0,"error":"inference failed"}}'
"""
    out, err, rc = run_on_octavia(script, timeout=60)

    try:
        result = json.loads(out.strip().split('\n')[-1])
    except:
        result = {"objects": [], "inference_ms": 0, "error": f"parse failed: {out[:200]} {err[:200]}"}

    # Map class IDs to labels
    for obj in result.get("objects", []):
        cls_id = obj.get("label", 0)
        if isinstance(cls_id, int) and cls_id < len(COCO_LABELS):
            obj["label"] = COCO_LABELS[cls_id]

    result["total_ms"] = int((time.time()-t0)*1000)
    result["device"] = "Hailo-8 (26 TOPS)"
    result["model"] = "yolov5s"
    return result

@app.get("/", response_class=HTMLResponse)
def index():
    return """<!DOCTYPE html><html><head><title>Hailo Vision</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;color:#fff;font-family:'Space Grotesk',sans-serif;padding:40px}
h1{margin-bottom:20px}input{margin:20px 0}pre{background:#111;padding:20px;border-radius:8px;overflow:auto;margin-top:20px}</style></head>
<body><h1>Hailo-8 Object Detection</h1><p>Upload an image for YOLOv5 inference on 26 TOPS hardware</p>
<input type="file" id="img" accept="image/*"><button onclick="run()">Detect</button><pre id="out">waiting...</pre>
<script>async function run(){const f=document.getElementById('img').files[0];if(!f)return;const d=new FormData();d.append('image',f);
document.getElementById('out').textContent='running...';const r=await fetch('/detect',{method:'POST',body:d});
document.getElementById('out').textContent=JSON.stringify(await r.json(),null,2)}</script></body></html>"""

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8200)
