#!/bin/bash

# cd /workspace/svelteflow
# gradio cc build
# python demo/app.py

cd frontend
npm run build:custom

cd ..
gradio cc install
gradio cc build

python demo/app.py
