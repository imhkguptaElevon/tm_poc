# Teachable Machine POC

A proof-of-concept web app replicating the core features of Teachable Machine's image training UI, built with React, Vite, Material-UI, and TensorFlow.js.

## Features
- Add/remove/rename class labels
- Collect images per class (webcam + upload)
- Train an image classifier in-browser
- Preview and export the trained model

## Setup

```bash
npm install
npm run dev -- --port 3000
```

App will be available at [http://localhost:3000](http://localhost:3000)

## Tech Stack
- React + Vite
- Material-UI
- TensorFlow.js

## Roadmap
- [x] Class management
- [x] Image collection (webcam/upload)
- [x] Model training
- [x] Export model
- [ ] Inference preview

---

Inspired by [Teachable Machine](https://teachablemachine.withgoogle.com/train/image)
