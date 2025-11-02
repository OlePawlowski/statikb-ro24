Drone Three.js Demo
===================

What this is
- A minimal Node.js project that serves a Three.js scene.
- The scene constructs a low-poly drone from primitives (no external 3D model files).
- Rotor meshes are separate and continuously spin. UI lets you pause/resume and change RPM.

How to run
1. Extract the project.
2. In the project folder, run:
   npm install
   npm start
3. Open http://localhost:3000 in your browser.

Files
- server.js         : small Express server that serves the public folder
- package.json      : dependency (express)
- public/index.html : the page
- public/main.js    : Three.js code that builds the drone and spins the rotors

Notes
- Uses Three.js from unpkg CDN (module imports).
- If you prefer a downloadable glTF/GLB instead of procedurally generated geometry, tell me and I can export a glTF file next (but that requires creating a file asset).
