#!/bin/bash

cd svelteflow
gradio cc install
gradio cc build

python demo/app.py
