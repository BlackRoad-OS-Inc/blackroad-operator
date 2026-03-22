#!/usr/bin/env python3
"""BlackRoad Hailo-8 Inference API
Exposes object detection, pose estimation, and classification via HTTP.
Runs on Cecilia (:8088) and Octavia (:8088).

Usage: python3 hailo-api.py [--port 8088] [--model yolov8s]
"""

import json
import sys
import os
import time
import base64
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from io import BytesIO

try:
    from hailo_platform import HEF, VDevice, HailoStreamInterface, InferVStreams, ConfigureParams, FormatType
    HAILO_OK = True
except ImportError:
    HAILO_OK = False
    print("[WARN] hailo_platform not found — running in stub mode")

import numpy as np

MODEL_DIR = "/usr/share/hailo-models"
MODELS = {
    "yolov8s": {"file": "yolov8s_h8.hef", "type": "detection", "desc": "Object detection (COCO 80 classes)"},
    "yolov8s-pose": {"file": "yolov8s_pose_h8.hef", "type": "pose", "desc": "Pose estimation (17 keypoints)"},
    "yolov5s-face": {"file": "yolov5s_personface_h8l.hef", "type": "detection", "desc": "Person + face detection"},
    "yolov6n": {"file": "yolov6n_h8.hef", "type": "detection", "desc": "Nano object detection (fast)"},
    "resnet50": {"file": "resnet_v1_50_h8l.hef", "type": "classification", "desc": "ImageNet classification"},
    "yolox-s": {"file": "yolox_s_leaky_h8l_rpi.hef", "type": "detection", "desc": "YOLOX small detection"},
}

# Loaded HEF cache
loaded = {}
vdevice = None

def get_vdevice():
    global vdevice
    if vdevice is None and HAILO_OK:
        vdevice = VDevice()
    return vdevice

def load_model(name):
    if name in loaded:
        return loaded[name]
    info = MODELS.get(name)
    if not info:
        return None
    path = os.path.join(MODEL_DIR, info["file"])
    if not os.path.exists(path):
        # Try alternate paths
        for alt in ["/mnt/nvme/models", os.path.expanduser("~/models")]:
            alt_path = os.path.join(alt, info["file"])
            if os.path.exists(alt_path):
                path = alt_path
                break
    if not os.path.exists(path):
        return None
    hef = HEF(path)
    loaded[name] = hef
    return hef

def run_inference(model_name, input_data):
    if not HAILO_OK:
        return {"error": "hailo_platform not installed"}
    hef = load_model(model_name)
    if not hef:
        return {"error": f"model {model_name} not found"}

    dev = get_vdevice()
    configure_params = ConfigureParams.create_from_hef(hef, interface=HailoStreamInterface.PCIe)
    network_group = dev.configure(hef, configure_params)[0]
    network_group_params = network_group.create_params()

    input_vstreams = network_group.input_vstream_infos
    output_vstreams = network_group.output_vstream_infos

    # Prepare input
    input_shape = input_vstreams[0].shape
    if input_data is not None:
        data = np.frombuffer(input_data, dtype=np.uint8).reshape(1, *input_shape)
    else:
        data = np.random.randint(0, 255, size=(1, *input_shape), dtype=np.uint8)

    start = time.time()
    with InferVStreams(network_group, network_group_params) as pipeline:
        input_dict = {input_vstreams[0].name: data}
        results = pipeline.infer(input_dict)
    elapsed = time.time() - start

    # Format output
    output = {}
    for vstream_info in output_vstreams:
        result = results[vstream_info.name]
        output[vstream_info.name] = {
            "shape": list(result.shape),
            "dtype": str(result.dtype),
            "sample": result.flatten()[:20].tolist(),
        }

    return {
        "model": model_name,
        "type": MODELS[model_name]["type"],
        "input_shape": list(input_shape),
        "inference_ms": round(elapsed * 1000, 2),
        "outputs": output,
    }


class HailoHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # quiet

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _json(self, data, code=200):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/health":
            self._json({
                "status": "up",
                "service": "hailo-api",
                "hailo": HAILO_OK,
                "device": "Hailo-8 (26 TOPS)",
                "models": len(MODELS),
            })
        elif self.path == "/api/models":
            available = {}
            for name, info in MODELS.items():
                path = os.path.join(MODEL_DIR, info["file"])
                exists = os.path.exists(path)
                if not exists:
                    for alt in ["/mnt/nvme/models", os.path.expanduser("~/models")]:
                        if os.path.exists(os.path.join(alt, info["file"])):
                            exists = True
                            break
                available[name] = {**info, "available": exists}
            self._json({"models": available})
        elif self.path.startswith("/api/benchmark/"):
            model = self.path.split("/")[-1]
            if model not in MODELS:
                self._json({"error": f"unknown model: {model}"}, 404)
                return
            result = run_inference(model, None)
            self._json(result)
        else:
            self._json({"error": "not found", "endpoints": ["/api/health", "/api/models", "/api/benchmark/<model>", "POST /api/infer"]}, 404)

    def do_POST(self):
        if self.path == "/api/infer":
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length else {}
            model = body.get("model", "yolov8s")
            # Accept base64-encoded image data
            image_b64 = body.get("image")
            image_data = base64.b64decode(image_b64) if image_b64 else None
            result = run_inference(model, image_data)
            self._json(result)
        else:
            self._json({"error": "not found"}, 404)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BlackRoad Hailo-8 API")
    parser.add_argument("--port", type=int, default=8088)
    args = parser.parse_args()

    print(f"[hailo-api] Starting on :{args.port} | Hailo: {HAILO_OK} | Models: {len(MODELS)}")
    server = HTTPServer(("0.0.0.0", args.port), HailoHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
