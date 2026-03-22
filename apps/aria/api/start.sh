#!/bin/bash
cd ~/blackroad-api
~/.local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
