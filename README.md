# JavaScript Fur/Hair Simulation with GPGPU & PBD Physics

---

## Table of Contents
- [JavaScript Fur/Hair Simulation with GPGPU \& PBD Physics](#javascript-furhair-simulation-with-gpgpu--pbd-physics)
  - [Table of Contents](#table-of-contents)
  - [Video](#video)
  - [Key Features](#key-features)
  - [Technologies](#technologies)
  - [Technical Overview](#technical-overview)
  - [Performance Notes](#performance-notes)
  - [Project Structure](#project-structure)
  - [How to Run](#how-to-run)
  - [Background \& Credits](#background--credits)
  - [Future Improvements](#future-improvements)
  - [Author](#author)


---

## Video

[Video](https://www.youtube.com/watch?v=nm2NeTOQWpk)

---

## Key Features

* Fur/Hair simulation based on **Position Based Dynamics (PBD)** for stability and scalability
* **GPGPU-based physics**: each strand simulated in parallel on the GPU
* Runs entirely in the **browser using JavaScript**
* **Three.js rendering** with **custom vertex & fragment shaders**
* Interactive forces: wind direction & strength, mouse drag point forces
* Unlike common examples, this project simulates **real physics**, not noise-based animation

---

## Technologies

* JavaScript
* GLSL
* Three.js

---

## Technical Overview

The simulation runs almost entirely on the GPU. A **GPGPU fragment shader** computes the physics and writes the results to a texture. This texture is then consumed by **custom vertex and fragment shaders** for rendering. Each frame, dynamic parameters (wind, mouse forces) are sent from CPU to GPU. Only the initial strand setup runs on the CPU.

---

## Performance Notes

* **31,000 strands** running at **30+ FPS** on GPU
* Same algorithm on CPU: **15,000 strands < 5 FPS**

---

## Project Structure

```text
/src                → application source code (JS, HTML, CSS)
/src/shaders        → rendering shaders
/src/shaders/gpgpu  → GPGPU physics fragment shader
```

---

## How to Run

```bash
npm install
npm run dev
```

---

## Background & Credits

PBD concepts inspired by the **“10 Minute Physics”** YouTube channel.
Implementation, GPGPU pipeline, and rendering architecture are original.

---

## Future Improvements

* Add fur to a movable sphere for a more interactive environment

---

## Author

**Mohsen Afshari**
