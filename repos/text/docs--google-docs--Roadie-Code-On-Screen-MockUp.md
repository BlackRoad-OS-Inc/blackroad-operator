# Roadie Code On-Screen MockUp

**Source:** google-docs

---

.neon-title {

color: #fff;

text-shadow:

0 0 5px #fff,    /* small white glow */

0 0 10px #fff,

0 0 20px #0ff,   /* cyan glow */

0 0 30px #0ff;

}

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>BlackRoad Console</title>

<link rel="stylesheet" href="styles.css"/>

</head>

<body>

<div class="console-container">

<div class="ipad">

<div class="logo">BlackRoad</div>

<h1>Venture Portal</h1>

<p>Bridging visionary strategy and deep tech execution</p>

<div class="panel">

<h2>Quantum Computing</h2>

<p>Promising insights with superposition and qubits</p>

</div>

<div class="panel">

<h2>Market Trends</h2>

<p>Investors / Startups</p>

</div>

</div>

<div class="cube">

<div class="cube-box">

<div class="hologram"></div>

</div>

<div class="branding">BlackRoad</div>

</div>

<div class="keyboard">

<!-- Simulated full-size keyboard -->

<div class="key-row">

<div class="key">ESC</div><div class="key">F1</div><div class="key">F2</div>... <!-- add more -->

</div>

<!-- add other rows here -->

</div>

</div>

</body>

</html>

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>BlackRoad Console</title>

<link rel="stylesheet" href="styles.css"/>

</head>

<body>

<div class="console-container">

<div class="ipad">

<div class="logo">BlackRoad</div>

<h1>Venture Portal</h1>

<p>Bridging visionary strategy and deep tech execution</p>

<div class="panel">

<h2>Quantum Computing</h2>

<p>Promising insights with superposition and qubits</p>

</div>

<div class="panel">

<h2>Market Trends</h2>

<p>Investors / Startups</p>

</div>

</div>

<div class="cube">

<div class="cube-box">

<div class="hologram"></div>

</div>

<div class="branding">BlackRoad</div>

</div>

<div class="keyboard">

<!-- Simulated full-size keyboard -->

<div class="key-row">

<div class="key">ESC</div><div class="key">F1</div><div class="key">F2</div>... <!-- add more -->

</div>

<!-- add other rows here -->

</div>

</div>

</body>

</html>

—------

body {

margin: 0;

background: #000;

font-family: 'Segoe UI', sans-serif;

color: white;

}

.console-container {

display: flex;

flex-direction: column;

align-items: center;

justify-content: center;

}

.ipad {

background: #111;

padding: 2rem;

border-radius: 1rem;

width: 300px;

margin-bottom: 1rem;

box-shadow: 0 0 30px #0ff4;

}

.logo {

font-size: 1.4rem;

font-weight: bold;

color: #fff;

}

.panel {

background: #222;

border-left: 3px solid #0ff;

padding: 1rem;

margin-top: 1rem;

}

.cube {

margin: 2rem 0;

text-align: center;

}

.cube-box {

width: 300px;

height: 300px;

border: 2px solid rgba(0, 255, 255, 0.4);

position: relative;

background: rgba(255,255,255,0.01);

backdrop-filter: blur(5px);

}

.hologram {

width: 100%;

height: 100%;

background: radial-gradient(circle, rgba(0,255,255,0.3), transparent);

animation: pulse 2s infinite;

}

.branding {

margin-top: 1rem;

font-size: 1.2rem;

}

.keyboard {

display: flex;

flex-wrap: wrap;

max-width: 700px;

margin-top: 2rem;

gap: 4px;

}

.key-row {

display: flex;

flex-wrap: nowrap;

gap: 4px;

margin-bottom: 4px;

}

.key {

background: #222;

padding: 0.6rem 1rem;

border-radius: 6px;

color: white;

box-shadow: 0 0 5px #0ff4;

min-width: 40px;

text-align: center;

}

@keyframes pulse {

0% { transform: scale(1); opacity: 0.6; }

50% { transform: scale(1.05); opacity: 1; }

100% { transform: scale(1); opacity: 0.6; }

}

—-------

blackroad-console/

├── index.html

├── styles.css

├── assets/

│   ├── blackroad-logo.svg

│   ├── hologram-gradient.svg

│   ├── keyboard.png (or styled in code)

—----

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>BlackRoad Console</title>

<link rel="stylesheet" href="styles.css" />

</head>

<body>

<div class="console-container">

<div class="top-section">

<!-- iPad Section -->

<div class="ipad">

<img src="assets/blackroad-logo.svg" class="logo" alt="BlackRoad logo"/>

<h1>Venture Portal</h1>

<p class="subheading">Bridging visionary strategy and deep tech execution</p>

<div class="panel">

<h2>Quantum Computing</h2>

<p>Priority: move insights with equations / qubits</p>

</div>

<div class="panel">

<h2>Market Trends</h2>

<p>Investors / Startups</p>

</div>

</div>

<!-- Hologram Cube -->

<div class="hologram-box">

<div class="glass-cube">

<img src="assets/blackroad-logo.svg" class="hologram-logo" alt="Hologram logo" />

</div>

<div class="cube-base">

<img src="assets/blackroad-logo.svg" class="base-logo" />

<span class="base-text">BlackRoad</span>

</div>

</div>

</div>

<!-- Keyboard -->

<div class="keyboard">

<!-- Could use image or render keys with <div class="key"> -->

<img src="assets/keyboard.png" alt="Keyboard layout" />

</div>

</div>

</body>

</html>

—------------------

body {

margin: 0;

background: #000;

color: white;

font-family: 'Segoe UI', sans-serif;

}

.console-container {

display: flex;

flex-direction: column;

align-items: center;

justify-content: center;

}

.top-section {

display: flex;

justify-content: center;

align-items: flex-start;

gap: 3rem;

}

.ipad {

width: 320px;

background-color: #111;

padding: 2rem;

border-radius: 20px;

box-shadow: 0 0 20px rgba(255,255,255,0.1);

}

.logo {

width: 80px;

margin-bottom: 1rem;

}

.panel {

margin-top: 1.5rem;

background: #1a1a1a;

padding: 1rem;

border-left: 3px solid #00bcd4;

}

.hologram-box {

display: flex;

flex-direction: column;

align-items: center;

}

.glass-cube {

width: 320px;

height: 320px;

border: 2px solid rgba(255, 255, 255, 0.3);

backdrop-filter: blur(3px);

display: flex;

align-items: center;

justify-content: center;

}

.hologram-logo {

width: 180px;

opacity: 0.95;

}

.cube-base {

margin-top: 1rem;

background-color: #111;

padding: 1rem 2rem;

border-radius: 8px;

display: flex;

align-items: center;

gap: 1rem;

}

.base-logo {

width: 40px;

}

.base-text {

font-size: 1.5rem;

font-weight: bold;

}

.keyboard {

margin-top: 2rem;

}

.keyboard img {

max-width: 800px;

width: 100%;

filter: brightness(0.9);

}

—-------

my-blackroad-app/

├─ public/

│   └─ index.html              # Container HTML (for React/Electron to load)

├─ src/

│   ├─ components/

│   │   ├─ LeftPanel.jsx       # Left iPad-style portal UI

│   │   ├─ HologramCanvas.jsx  # Three.js Canvas with cube & hologram

│   │   ├─ KeyboardVisual.jsx  # (Optional) Visual keyboard component or image

│   │   └─ HoloController.jsx  # (Optional) logic for hologram animation control

│   ├─ App.jsx                 # Main layout combining all components

│   ├─ index.jsx               # React DOM render, etc.

│   └─ styles.css              # Tailwind base styles (import Tailwind here)

├─ package.json

├─ tailwind.config.js          # Tailwind configuration

├─ electron.js                 # (Electron only) main process script

└─ src-tauri/                  # (Tauri only) Tauri config and Rust source

—----

// App.jsx (simplified)

export default function App() {

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-5xl">

<LeftPanel />

<HologramCanvas />

</div>

<KeyboardVisual />

</div>

);

}

—----

// LeftPanel.jsx

function LeftPanel() {

return (

<div className="bg-gray-900 rounded-2xl p-6 m-4 w-80 relative">

{/* Tablet bezel (optional camera dot) */}

<div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>

{/* Branding and content */}

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-6 mb-4" />

<h1 className="text-2xl font-bold mb-2">Venture Portal</h1>

<p className="text-gray-300 mb-6">Bridging visionary strategy<br/>and deep tech execution</p>

<div className="space-y-4">

<section>

<h2 className="text-xl font-semibold">Quantum Computing</h2>

<p className="text-sm text-gray-400">Priority: move insights with equations / Qubits</p>

</section>

<section>

<h2 className="text-xl font-semibold">Market Trends</h2>

<p className="text-sm text-gray-400">Investors / Startups</p>

</section>

</div>

</div>

);

}

—-----

// HologramCanvas.jsx

import { Canvas } from '@react-three/fiber'

import { MeshTransmissionMaterial, OrbitControls, Html, Text } from '@react-three/drei'

function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

{/* Lights */}

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />  {/* Upward glow from base */}

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

{/* Base block */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#000000" metalness={0.5} roughness={0.8} />

{/* Logo on base front face */}

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Holographic object (e.g., a torus knot) */}

<mesh position={[0, 1.5, 0]} rotation={[0, 0, 0]} >

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

{/* Controls & effects */}

<OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />

</Canvas>

);

}

—-------

-​​—---

import { Edges } from '@react-three/drei';

// inside Canvas, within the cube mesh:

<Edges geometry={nodes.cube.geometry} scale={1.01}>

<meshBasicMaterial color="#00ffff" />

</Edges>

—---

// KeyboardVisual.jsx

export default function KeyboardVisual() {

return <img src="/keyboard.png" alt="Keyboard" className="w-[600px] mx-auto mb-4" />;

}

—---

// at top of HologramCanvas.jsx

import { useFrame } from '@react-three/fiber';

// ...

function HologramCanvas() {

// create a ref for the hologram mesh

const holoRef = useRef();

useFrame((state, delta) => {

// rotate the hologram continuously

if (holoRef.current) {

holoRef.current.rotation.y += delta * 0.5; // spin around Y-axis

}

});

return (

<Canvas>{/* ... */}

<mesh ref={holoRef} position={[0,1.5,0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

{/* ... */}

</Canvas>

);

}

—-----

// HoloController.jsx (or could be in App.jsx)

import { useState, useEffect } from 'react';

function HoloController({ onUpdate }) {

const [input, setInput] = useState("");   // store typed keys, if needed

useEffect(() => {

const handleKeyDown = (e) => {

// Example: if Enter is pressed, reset input (could trigger a "run" action)

if (e.key === 'Enter') {

console.log("Equation entered:", input);

onUpdate(input);    // call parent callback with the current input

setInput("");

} else if (e.key === 'Backspace') {

setInput(prev => prev.slice(0, -1));

} else if (e.key.length === 1) {

// append character keys to input

setInput(prev => prev + e.key);

}

};

window.addEventListener('keydown', handleKeyDown);

return () => window.removeEventListener('keydown', handleKeyDown);

}, [input, onUpdate]);

return null; // no UI, this component just handles events

}

—-----

// In App.jsx

const [holoMode, setHoloMode] = useState("wave"); // default mode

const handleInput = (inputStr) => {

if (inputStr.toLowerCase().includes("torus")) {

setHoloMode("torus");

} else if (inputStr.toLowerCase().includes("wave")) {

setHoloMode("wave");

}

// ... other conditions

};

// Pass holoMode to HologramCanvas as prop

<HologramCanvas mode={holoMode} />

<HoloController onUpdate={handleInput} />

—----------------

// snippet inside HologramCanvas render

{mode === "torus" ? (

<mesh ref={holoRef} position={[0,1.5,0]}>

<torusGeometry args={[0.5, 0.2, 30, 64]} />

<meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={1} wireframe />

</mesh>

) : (

<mesh ref={holoRef} position={[0,1.5,0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe />

</mesh>

)}

____________

// electron.js (main process)

const { app, BrowserWindow } = require('electron');

const path = require('path');

function createWindow() {

const win = new BrowserWindow({

width: 1280, height: 800,

webPreferences: {

preload: path.join(__dirname, 'preload.js'), // if using a preload script

}

});

if (app.isPackaged) {

win.loadFile(path.join(__dirname, 'build/index.html'));  // production build

} else {

win.loadURL('http://localhost:3000');  // dev server

}

}

app.whenReady().then(createWindow);

—-----

"scripts": {

"start": "react-scripts start",         // start React dev server

"electron": "electron .",               // launch Electron (in dev, after React is running)

"dev": "concurrently \"npm run start\" \"npm run electron\""

}

—------

"scripts": {

"start": "react-scripts start",         // start React dev server

"electron": "electron .",               // launch Electron (in dev, after React is running)

"dev": "concurrently \"npm run start\" \"npm run electron\""

}

// App.jsx

import React from 'react';

import LeftPanel from './components/LeftPanel';

import HologramCanvas from './components/HologramCanvas';

import Keyboard from './components/Keyboard';

export default function App() {

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<LeftPanel />

<HologramCanvas />

</div>

<Keyboard />

</div>

);

}

// components/LeftPanel.jsx

import React from 'react';

export default function LeftPanel() {

return (

<div className="bg-zinc-900 rounded-2xl p-6 w-80 shadow-lg">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-6 mb-4" />

<h1 className="text-2xl font-bold mb-2">Venture Portal</h1>

<p className="text-gray-400 mb-6">Bridging visionary strategy<br/>and deep tech execution</p>

<div className="space-y-4">

<section>

<h2 className="text-xl font-semibold">Quantum Computing</h2>

<p className="text-sm text-gray-500">Priority: move insights with equations / Qubits</p>

</section>

<section>

<h2 className="text-xl font-semibold">Market Trends</h2>

<p className="text-sm text-gray-500">Investors / Startups</p>

</section>

</div>

</div>

);

}

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

function HologramContent() {

const hologramRef = useRef();

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Holographic Object */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

// components/Keyboard.jsx

import React from 'react';

export default function Keyboard() {

return (

<div className="mt-10">

<img src="/keyboard.png" alt="Keyboard" className="w-[700px] mx-auto" />

</div>

);

}

—----

// App.jsx

import React from 'react';

import LeftPanel from './components/LeftPanel';

import HologramCanvas from './components/HologramCanvas';

import Keyboard from './components/Keyboard';

export default function App() {

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<LeftPanel />

<HologramCanvas />

</div>

<Keyboard />

</div>

);

}

// components/LeftPanel.jsx

import React from 'react';

export default function LeftPanel() {

return (

<div className="bg-zinc-900 rounded-2xl p-6 w-80 shadow-lg">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-6 mb-4" />

<h1 className="text-2xl font-bold mb-2">Venture Portal</h1>

<p className="text-gray-400 mb-6">Bridging visionary strategy<br/>and deep tech execution</p>

<div className="space-y-4">

<section>

<h2 className="text-xl font-semibold">Quantum Computing</h2>

<p className="text-sm text-gray-500">Priority: move insights with equations / Qubits</p>

</section>

<section>

<h2 className="text-xl font-semibold">Market Trends</h2>

<p className="text-sm text-gray-500">Investors / Startups</p>

</section>

</div>

</div>

);

}

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

function HologramContent() {

const hologramRef = useRef();

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Holographic Object */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

// components/Keyboard.jsx

import React from 'react';

export default function Keyboard() {

return (

<div className="mt-10">

<img src="/keyboard.png" alt="Keyboard" className="w-[700px] mx-auto" />

</div>

);

}

—----

export default function App() {

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<LeftPanel />

<HologramCanvas />

</div>

<Keyboard />

</div>

);

}

—-----

export default function LeftPanel() {

return (

<div className="bg-zinc-900 rounded-2xl p-6 w-80 shadow-lg">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-6 mb-4" />

<h1 className="text-2xl font-bold mb-2">Venture Portal</h1>

<p className="text-gray-400 mb-6">

Bridging visionary strategy<br />and deep tech execution

</p>

<div className="space-y-4">

<section>

<h2 className="text-xl font-semibold">Quantum Computing</h2>

<p className="text-sm text-gray-500">

Priority: move insights with equations / Qubits

</p>

</section>

<section>

<h2 className="text-xl font-semibold">Market Trends</h2>

<p className="text-sm text-gray-500">Investors / Startups</p>

</section>

</div>

</div>

);

}

—------------

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

function HologramContent() {

const hologramRef = useRef();

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0}

transmission={1}

ior={1.1}

chromaticAberration={0.01}

/>

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Holographic Object */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial

color="#00ffff"

emissive="#00ffff"

emissiveIntensity={1}

wireframe={true}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—---------

import React from 'react';

export default function Keyboard() {

return (

<div className="mt-10">

<img src="/keyboard.png" alt="Keyboard" className="w-[700px] mx-auto" />

</div>

);

}

—----

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Text } from '@react-three/drei';

function HologramContent() {

const hologramRef = useRef();

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Floating Logo Inside Cube */}

<mesh position={[0, 1.5, 0]}>

<planeGeometry args={[1, 0.3]} />

<meshStandardMaterial transparent opacity={0.9}>

<texture attach="map" image={new Image()} />

</meshStandardMaterial>

<Html position={[0, 0, 0]} center transform occlude>

<img src="/blackroad-logo.png" alt="Floating Logo" style={{ width: '120px', opacity: 0.95 }} />

</Html>

</mesh>

{/* Holographic Object */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

_—---

import React from 'react';

import LeftPanel from './components/LeftPanel';

import HologramCanvas from './components/HologramCanvas';

import Keyboard from './components/Keyboard';

export default function App() {

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<LeftPanel />

<HologramCanvas />

</div>

<Keyboard />

</div>

);

}

—-

import React from 'react';

export default function LeftPanel() {

return (

<div className="bg-zinc-900 rounded-2xl p-6 w-80 shadow-lg">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-6 mb-4" />

<h1 className="text-2xl font-bold mb-2">Venture Portal</h1>

<p className="text-gray-400 mb-6">Bridging visionary strategy<br />and deep tech execution</p>

<div className="space-y-4">

<section>

<h2 className="text-xl font-semibold">Quantum Computing</h2>

<p className="text-sm text-gray-500">Priority: move insights with equations / Qubits</p>

</section>

<section>

<h2 className="text-xl font-semibold">Market Trends</h2>

<p className="text-sm text-gray-500">Investors / Startups</p>

</section>

</div>

</div>

);

}

_—---

​​

—---

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

function HologramContent() {

const hologramRef = useRef();

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.4, 0.15, 100, 16]} />

<meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} wireframe={true} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—------

// components/Keyboard.jsx

import React, { useEffect, useState } from 'react';

const keys = [

['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],

['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'],

['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],

['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],

['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],

['CTRL', 'ALT', 'CMD', 'SPACE', 'CMD', 'ALT']

];

export default function Keyboard() {

const [activeKey, setActiveKey] = useState(null);

const [typed, setTyped] = useState('');

useEffect(() => {

const handleKeyDown = (e) => {

const key = e.key.toUpperCase();

setActiveKey(key === ' ' ? 'SPACE' : key);

setTyped(prev => prev + (key === ' ' ? ' ' : key));

};

const handleKeyUp = () => setActiveKey(null);

window.addEventListener('keydown', handleKeyDown);

window.addEventListener('keyup', handleKeyUp);

return () => {

window.removeEventListener('keydown', handleKeyDown);

window.removeEventListener('keyup', handleKeyUp);

};

}, []);

return (

<div className="mt-10 w-full flex flex-col items-center">

<div className="text-white text-lg mb-4">{typed}</div>

<div className="space-y-1">

{keys.map((row, rowIndex) => (

<div key={rowIndex} className="flex justify-center gap-1">

{row.map((key) => (

<div

key={key}

className={`px-3 py-2 rounded text-sm font-mono border border-gray-700 text-white ${

activeKey === key || (key === 'SPACE' && activeKey === ' ') ? 'bg-cyan-500' : 'bg-zinc-800'

}`}

>

{key === 'SPACE' ? '␣' : key}

</div>

))}

</div>

))}

</div>

</div>

);

}

—----

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const hologramRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.5;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial thickness={0.2} roughness={0} transmission={1} ior={1.1} chromaticAberration={0.01} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#111" metalness={0.5} roughness={0.8} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Curved, Glowing Logo */}

<mesh ref={hologramRef} position={[0, 1.5, 0]} rotation={[0, Math.PI, 0]}>

<sphereGeometry args={[0.5, 64, 64]} />

<meshStandardMaterial

map={logoTexture}

emissive={new THREE.Color('#ffffff')}

emissiveIntensity={2.5}

transparent

opacity={0.85}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.2} />

<pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.0} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const hologramRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0}

transmission={1}

ior={1.1}

chromaticAberration={0.005}

/>

</mesh>

{/* Cube Base - iPad-gray tone */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#1e1e1e" metalness={0.3} roughness={0.6} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Glowing Orb-like Logo */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<sphereGeometry args={[0.48, 64, 64]} />

<meshStandardMaterial

map={logoTexture}

emissive={new THREE.Color('#ffffff')}

emissiveIntensity={2.0}

transparent

opacity={0.9}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.3} />

<pointLight position={[0, 5, 5]} intensity={1.0} color="#ffffff" />

<pointLight position={[0, -5, 0]} intensity={1.2} color="#00ffff" />

<HologramContent />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-------

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Environment } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const hologramRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0}

transmission={1}

ior={1.1}

chromaticAberration={0.005}

/>

</mesh>

{/* Cube Base - iPad-gray tone */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#1e1e1e" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Glowing Orb-like Logo */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<sphereGeometry args={[0.48, 64, 64]} />

<meshStandardMaterial

map={logoTexture}

emissive={new THREE.Color('#ffffff')}

emissiveIntensity={3.0}

transparent

opacity={0.92}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ffff" />

<HologramContent />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—------

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Environment } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const hologramRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0}

transmission={1}

ior={1.1}

chromaticAberration={0.005}

/>

</mesh>

{/* Cube Base - lightened gray */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Glowing Orb-like Logo */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<sphereGeometry args={[0.48, 64, 64]} />

<meshStandardMaterial

map={logoTexture}

emissive={new THREE.Color('#ffffff')}

emissiveIntensity={3.0}

transparent

opacity={0.92}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ffff" />

<HologramContent />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—--------

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Environment } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const hologramRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (hologramRef.current) {

hologramRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0}

transmission={1}

ior={1.1}

chromaticAberration={0.005}

/>

</mesh>

{/* Cube Base - medium gray for contrast */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Glowing Orb-like Logo */}

<mesh ref={hologramRef} position={[0, 1.5, 0]}>

<sphereGeometry args={[0.48, 64, 64]} />

<meshStandardMaterial

map={logoTexture}

emissive={new THREE.Color('#ffffff')}

emissiveIntensity={3.0}

transparent

opacity={0.92}

/>

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ffff" />

<HologramContent />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-------

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Environment } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const roadieRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (roadieRef.current) {

roadieRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0.05}

transmission={1}

ior={1.1}

chromaticAberration={0.003}

anisotropy={0.1}

/>

</mesh>

{/* Cube Base - light gray for visibility */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Roadie Character (placeholder sphere body with glowing logo) */}

<group ref={roadieRef} position={[0, 1.55, 0]}>

{/* Head */}

<mesh position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

{/* Body */}

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

{/* Chest Logo */}

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

</group>

{/* Projection light from below */}

<mesh position={[0, 0.01, 0]}>

<circleGeometry args={[0.5, 64]} />

<meshBasicMaterial color="#00aaff" transparent opacity={0.15} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ccff" />

<HologramContent />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// components/HologramCanvas.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';

import { MeshTransmissionMaterial, OrbitControls, Html, Environment } from '@react-three/drei';

import * as THREE from 'three';

function HologramContent() {

const roadieRef = useRef();

const logoTexture = useLoader(THREE.TextureLoader, '/blackroad-logo.png');

useFrame((_, delta) => {

if (roadieRef.current) {

roadieRef.current.rotation.y += delta * 0.3;

}

});

return (

<>

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<MeshTransmissionMaterial

thickness={0.2}

roughness={0.05}

transmission={1}

ior={1.1}

chromaticAberration={0.003}

anisotropy={0.1}

/>

</mesh>

{/* Cube Base - light gray for visibility */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

{/* Roadie Character with educational hologram theme */}

<group ref={roadieRef} position={[0, 1.55, 0]}>

{/* Head */}

<mesh position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

{/* Body */}

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

{/* Chest Logo */}

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

</group>

{/* Educational Ring or Projection */}

<mesh position={[0, 1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>

<ringGeometry args={[0.6, 0.65, 64]} />

<meshBasicMaterial color="#00aaff" transparent opacity={0.3} />

</mesh>

</>

);

}

export default function HologramCanvas() {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} gl={{ antialias: true }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ccff" />

<HologramContent />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—--

// components/LeftPanel.jsx

import React from 'react';

export default function LeftPanel() {

return (

<div className="bg-zinc-900 rounded-2xl p-6 w-96 shadow-lg flex flex-col space-y-4">

{/* Logo and Title */}

<div className="flex items-center justify-between">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-8" />

<div className="bg-blue-800 text-white text-xs font-semibold px-3 py-1 rounded-full">Roadie</div>

</div>

<h1 className="text-3xl font-bold text-white leading-tight">Hologram<br />Club AI</h1>

{/* Prompt section */}

<div className="bg-zinc-800 rounded-xl p-4 text-white">

<p className="text-base font-medium flex items-center gap-2">

<span className="text-blue-400 text-xl">🧠</span> What do you want to learn about today?

</p>

</div>

{/* Example prompt */}

<div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-2 text-white">

<span className="text-xl">➕</span>

<p className="text-base">How far away is Jupiter?</p>

</div>

{/* Input bar */}

<div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">

<span className="text-yellow-400 text-xl">😊</span>

<input

type="text"

placeholder="Ask Roadie anything..."

className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400"

/>

<span className="text-blue-400 text-lg">🎤</span>

</div>

{/* Categories */}

<div className="flex gap-2 mt-2">

<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold">Explore Space</button>

<button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Learn Math</button>

<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">See Animals</button>

</div>

{/* Recent Questions */}

<div className="mt-4">

<h2 className="text-sm text-gray-400 uppercase tracking-wide mb-1">Recent Questions</h2>

<ul className="text-white space-y-1 text-sm">

<li>How many moons does Saturn have?</li>

<li>What is 12 x 7?</li>

<li>Show me a dinosaur!</li>

</ul>

</div>

</div>

);

}

—---

<input

type="text"

placeholder="Ask Roadie anything..."

className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400 z-10 relative pointer-events-auto"

/>

—-

className="relative z-10"

—

// App.jsx (new full layout for BlackRoad Hologram Console)

import React, { useState } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

export default function App() {

const [prompt, setPrompt] = useState('');

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<HologramCube prompt={prompt} />

</div>

<Keyboard />

</div>

);

}

—---

// App.jsx (new full layout for BlackRoad Hologram Console)

import React, { useState } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

export default function App() {

const [prompt, setPrompt] = useState('');

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-center items-start w-full max-w-6xl gap-10 mt-8">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<HologramCube prompt={prompt} />

</div>

<Keyboard setPrompt={setPrompt} />

</div>

);

}

—-----

// components/HologramCube.jsx

import React, { useRef } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment } from '@react-three/drei';

function ShapeSelector({ prompt }) {

if (!prompt) return null;

const query = prompt.toLowerCase();

if (query.includes('planet') || query.includes('jupiter')) {

return (

<mesh position={[0, 1.5, 0]}>

<sphereGeometry args={[0.4, 64, 64]} />

<meshStandardMaterial color="#2264e3" emissive="#2244ff" emissiveIntensity={1.5} />

</mesh>

);

} else if (query.includes('star') || query.includes('sun')) {

return (

<mesh position={[0, 1.5, 0]}>

<sphereGeometry args={[0.5, 64, 64]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffcc33" emissiveIntensity={2.5} />

</mesh>

);

} else if (query.includes('dinosaur')) {

return (

<Html position={[0, 1.5, 0]} transform>

<img src="/dino.png" alt="Dino" style={{ width: '120px' }} />

</Html>

);

} else {

return (

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.0} />

</mesh>

);

}

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="black"

transparent

opacity={0.1}

roughness={0.05}

metalness={0.3}

/>

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<ShapeSelector prompt={prompt} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—---

// components/HologramCube.jsx

import React, { useRef, Suspense } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF } from '@react-three/drei';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function ShapeSelector({ prompt }) {

if (!prompt) return null;

const query = prompt.toLowerCase();

if (query.includes('planet') || query.includes('jupiter')) {

return (

<mesh position={[0, 1.5, 0]}>

<sphereGeometry args={[0.4, 64, 64]} />

<meshStandardMaterial color="#2264e3" emissive="#2244ff" emissiveIntensity={1.5} />

</mesh>

);

} else if (query.includes('star') || query.includes('sun')) {

return (

<mesh position={[0, 1.5, 0]}>

<sphereGeometry args={[0.5, 64, 64]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffcc33" emissiveIntensity={2.5} />

</mesh>

);

} else if (query.includes('rocket')) {

return <Model path="/models/rocket.glb" scale={0.5} />;

} else if (query.includes('dinosaur')) {

return <Model path="/models/dino.glb" scale={1.5} />;

} else {

return (

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.0} />

</mesh>

);

}

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="black"

transparent

opacity={0.1}

roughness={0.05}

metalness={0.3}

/>

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—--

// components/HologramCube.jsx

import React, { useRef, Suspense } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF } from '@react-three/drei';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

return { type: "default" };

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return <Model path={result.path} scale={1.5} />;

}

if (result.type === "math") {

return (

<group>

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" />

</mesh>

))}

</group>

);

}

return (

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.0} />

</mesh>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }}>

<ambientLight intensity={0.4} />

<pointLight position={[0, 5, 5]} intensity={1.5} color="#ffffff" />

<pointLight position={[0, -3, 2]} intensity={1.4} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="black"

transparent

opacity={0.1}

roughness={0.05}

metalness={0.3}

/>

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.5} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—---------

// App.jsx (full layout with narration control)

import React, { useState, useEffect } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

function useSpeech(prompt, mute) {

useEffect(() => {

if (!prompt || mute) return;

let message = '';

const p = prompt.toLowerCase();

if (p.includes('3 + 4') || p.includes('3+4')) {

message = 'Three plus four is seven. Let me show you.';

} else if (p.includes('pyramid')) {

message = 'This is an ancient Egyptian pyramid, built over 4,000 years ago.';

} else if (p.includes('rocket')) {

message = 'Launching the holographic rocket.';

}

if (message) {

const utterance = new SpeechSynthesisUtterance(message);

window.speechSynthesis.speak(utterance);

}

}, [prompt, mute]);

}

export default function App() {

const [prompt, setPrompt] = useState('');

const [mute, setMute] = useState(false);

useSpeech(prompt, mute);

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

<div className="flex justify-between items-start w-full max-w-6xl px-8 mt-6">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<div className="flex flex-col items-end gap-2">

<button

onClick={() => setMute(!mute)}

className={`text-sm px-4 py-2 rounded-full font-semibold ${

mute ? 'bg-red-600' : 'bg-green-600'

}`}

>

{mute ? 'Unmute Roadie' : 'Mute Roadie'}

</button>

<HologramCube prompt={prompt} />

</div>

</div>

<Keyboard setPrompt={setPrompt} />

</div>

);

}

—----

// App.jsx (refined layout and visual symmetry)

import React, { useState, useEffect } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

function useSpeech(prompt, mute) {

useEffect(() => {

if (!prompt || mute) return;

let message = '';

const p = prompt.toLowerCase();

if (p.includes('3 + 4') || p.includes('3+4')) {

message = 'Three plus four is seven. Let me show you.';

} else if (p.includes('pyramid')) {

message = 'This is an ancient Egyptian pyramid, built over 4,000 years ago.';

} else if (p.includes('rocket')) {

message = 'Launching the holographic rocket.';

}

if (message) {

const utterance = new SpeechSynthesisUtterance(message);

window.speechSynthesis.speak(utterance);

}

}, [prompt, mute]);

}

export default function App() {

const [prompt, setPrompt] = useState('');

const [mute, setMute] = useState(false);

useSpeech(prompt, mute);

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">

<div className="flex justify-center items-start w-full max-w-7xl gap-12">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<div className="flex flex-col items-end gap-4">

<button

onClick={() => setMute(!mute)}

className={`text-sm px-4 py-2 rounded-full font-semibold ${

mute ? 'bg-red-600' : 'bg-green-600'

}`}

>

{mute ? 'Unmute Roadie' : 'Mute Roadie'}

</button>

<HologramCube prompt={prompt} />

</div>

</div>

<div className="mt-12">

<Keyboard setPrompt={setPrompt} />

</div>

</div>

);

}

—---

// components/InputPanel.jsx (visual update for iPad app layout)

import React from 'react';

export default function InputPanel({ prompt, setPrompt }) {

return (

<div className="bg-zinc-900 rounded-2xl p-8 w-[420px] shadow-xl flex flex-col space-y-5">

{/* Logo and Title */}

<div className="flex items-center justify-between">

<img src="/blackroad-logo.png" alt="BlackRoad" className="h-7" />

<div className="bg-blue-800 text-white text-xs font-semibold px-3 py-1 rounded-full">Roadie</div>

</div>

<h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">Hologram<br />Club AI</h1>

{/* Prompt Section */}

<div className="bg-zinc-800 rounded-xl p-4 text-white text-base font-medium flex items-center gap-2">

<span className="text-blue-400 text-xl">🧠</span> What do you want to learn about today?

</div>

{/* Sample Prompt */}

<div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-2 text-white text-sm">

<span className="text-xl">➕</span>

How far away is Jupiter?

</div>

{/* Input Box */}

<div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-4 py-3">

<span className="text-yellow-400 text-xl">😊</span>

<input

type="text"

value={prompt}

onChange={(e) => setPrompt(e.target.value)}

placeholder="Ask Roadie anything..."

className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400 z-10 relative pointer-events-auto"

/>

<span className="text-blue-400 text-lg">🎤</span>

</div>

{/* Category Buttons */}

<div className="flex gap-2 mt-1">

<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold">Explore Space</button>

<button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Learn Math</button>

<button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">See Animals</button>

</div>

{/* Recent Questions */}

<div className="mt-3">

<h2 className="text-sm text-gray-400 uppercase tracking-wide mb-1">Recent Questions</h2>

<ul className="text-white space-y-1 text-sm">

<li>How many moons does Saturn have?</li>

<li>What is 12 x 7?</li>

<li>Show me a dinosaur!</li>

</ul>

</div>

</div>

);

}

—---

// components/Keyboard.jsx (refined style for visual accuracy)

import React from 'react';

const rows = [

['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],

['~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '⌫'],

['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],

['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],

['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT'],

['CTRL', 'ALT', 'CMD', 'SPACE', 'CMD', 'ALT']

];

export default function Keyboard() {

return (

<div className="w-[700px] mx-auto p-3 bg-zinc-800 rounded-xl shadow-xl">

<div className="flex flex-col gap-1">

{rows.map((row, idx) => (

<div key={idx} className="flex justify-center gap-1">

{row.map((key) => (

<div

key={key}

className="bg-zinc-300 text-zinc-900 px-3 py-2 rounded-md text-xs font-mono shadow-sm min-w-[36px] text-center"

>

{key === 'SPACE' ? <span className="inline-block w-32">&nbsp;</span> : key}

</div>

))}

</div>

))}

</div>

</div>

);

}

—---

// components/HologramCube.jsx (polished lighting and glow)

import React, { useRef, Suspense } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

return { type: "default" };

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return <Model path={result.path} scale={1.5} />;

}

if (result.type === "math") {

return (

<group>

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />

</mesh>

))}

</group>

);

}

return (

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.5} />

</mesh>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="#ffffff"

transparent

opacity={0.04}

roughness={0.1}

metalness={0.5}

/>

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// components/HologramCube.jsx (with glow pulse animation)

import React, { useRef, Suspense, useEffect } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

import * as THREE from 'three';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

return { type: "default" };

}

function PulseGlow({ position }) {

const meshRef = useRef();

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

const scale = 1 + 0.05 * Math.sin(t * 3);

if (meshRef.current) meshRef.current.scale.set(scale, scale, scale);

});

return (

<mesh ref={meshRef} position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return (

<>

<Model path={result.path} scale={1.5} />

<PulseGlow position={[0, 1.2, 0]} />

</>

);

}

if (result.type === "math") {

return (

<group>

<PulseGlow position={[0, 1.2, 0]} />

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />

</mesh>

))}

</group>

);

}

return (

<>

<PulseGlow position={[0, 1.2, 0]} />

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.5} />

</mesh>

</>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="#ffffff"

transparent

opacity={0.04}

roughness={0.1}

metalness={0.5}

/>

</mesh>

{/* Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// components/HologramCube.jsx (Roadie animated hover + pulse)

import React, { useRef, Suspense } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

import * as THREE from 'three';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function RoadieAnimated() {

const groupRef = useRef();

const headRef = useRef();

const pulseRef = useRef();

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

if (groupRef.current) {

groupRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.05;

}

if (headRef.current) {

headRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;

}

if (pulseRef.current) {

const scale = 1 + 0.05 * Math.sin(t * 3);

pulseRef.current.scale.set(scale, scale, scale);

}

});

return (

<group ref={groupRef}>

<mesh ref={headRef} position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

<mesh ref={pulseRef} position={[0, -0.3, 0]}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

</group>

);

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

if (q.includes("roadie")) return { type: "roadie" };

return { type: "default" };

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return (

<>

<Model path={result.path} scale={1.5} />

<PulseGlow position={[0, 1.2, 0]} />

</>

);

}

if (result.type === "math") {

return (

<group>

<PulseGlow position={[0, 1.2, 0]} />

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />

</mesh>

))}

</group>

);

}

if (result.type === "roadie") {

return <RoadieAnimated />;

}

return (

<>

<PulseGlow position={[0, 1.2, 0]} />

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.5} />

</mesh>

</>

);

}

function PulseGlow({ position }) {

const meshRef = useRef();

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

const scale = 1 + 0.05 * Math.sin(t * 3);

if (meshRef.current) meshRef.current.scale.set(scale, scale, scale);

});

return (

<mesh ref={meshRef} position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="#ffffff"

transparent

opacity={0.04}

roughness={0.1}

metalness={0.5}

/>

</mesh>

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// components/HologramCube.jsx (Roadie with animated blinking eyes)

import React, { useRef, Suspense, useState } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

import * as THREE from 'three';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function RoadieAnimated() {

const groupRef = useRef();

const headRef = useRef();

const pulseRef = useRef();

const leftEyeRef = useRef();

const rightEyeRef = useRef();

const blinkDuration = 0.2;

const [blink, setBlink] = useState(false);

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

if (groupRef.current) {

groupRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.05;

}

if (headRef.current) {

headRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;

}

if (pulseRef.current) {

const scale = 1 + 0.05 * Math.sin(t * 3);

pulseRef.current.scale.set(scale, scale, scale);

}

const blinkCycle = t % 4;

setBlink(blinkCycle > 3.8 && blinkCycle < 4);

});

return (

<group ref={groupRef}>

{/* Head */}

<mesh ref={headRef} position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

{/* Eyes */}

<mesh ref={leftEyeRef} position={[-0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

<mesh ref={rightEyeRef} position={[0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

{/* Body */}

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

{/* Chest Logo */}

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

{/* Base Pulse */}

<mesh ref={pulseRef} position={[0, -0.3, 0]}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

</group>

);

}

// The rest of the component remains unchanged

// (ShapeSelector, promptClassifier, PulseGlow, and Canvas setup)

—-----------

// components/HologramCube.jsx (Roadie gesture reactions)

import React, { useRef, Suspense, useState } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

import * as THREE from 'three';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function RoadieAnimated({ gesture }) {

const groupRef = useRef();

const headRef = useRef();

const pulseRef = useRef();

const leftEyeRef = useRef();

const rightEyeRef = useRef();

const armRef = useRef();

const [blink, setBlink] = useState(false);

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

if (groupRef.current) {

groupRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.05;

if (gesture === "nod") {

groupRef.current.rotation.x = Math.sin(t * 2) * 0.1;

}

}

if (headRef.current) {

headRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;

}

if (pulseRef.current) {

const scale = 1 + 0.05 * Math.sin(t * 3);

pulseRef.current.scale.set(scale, scale, scale);

}

const blinkCycle = t % 4;

setBlink(blinkCycle > 3.8 && blinkCycle < 4);

if (armRef.current && gesture === "wave") {

armRef.current.rotation.z = Math.sin(t * 5) * 0.5;

}

});

return (

<group ref={groupRef}>

<mesh ref={headRef} position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

{/* Eyes */}

<mesh ref={leftEyeRef} position={[-0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

<mesh ref={rightEyeRef} position={[0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

{/* Arm (for waving) */}

<mesh ref={armRef} position={[0.22, 0.15, 0]}>

<boxGeometry args={[0.08, 0.2, 0.08]} />

<meshStandardMaterial color="#0b0b22" emissive="#3388ff" emissiveIntensity={0.5} />

</mesh>

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

<mesh ref={pulseRef} position={[0, -0.3, 0]}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

</group>

);

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

if (q.includes("roadie") && q.includes("wave")) return { type: "roadie", gesture: "wave" };

if (q.includes("roadie") && q.includes("nod")) return { type: "roadie", gesture: "nod" };

if (q.includes("roadie")) return { type: "roadie", gesture: null };

return { type: "default" };

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return (

<>

<Model path={result.path} scale={1.5} />

<PulseGlow position={[0, 1.2, 0]} />

</>

);

}

if (result.type === "math") {

return (

<group>

<PulseGlow position={[0, 1.2, 0]} />

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />

</mesh>

))}

</group>

);

}

if (result.type === "roadie") {

return <RoadieAnimated gesture={result.gesture} />;

}

return (

<>

<PulseGlow position={[0, 1.2, 0]} />

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.5} />

</mesh>

</>

);

}

function PulseGlow({ position }) {

const meshRef = useRef();

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

const scale = 1 + 0.05 * Math.sin(t * 3);

if (meshRef.current) meshRef.current.scale.set(scale, scale, scale);

});

return (

<mesh ref={meshRef} position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="#ffffff"

transparent

opacity={0.04}

roughness={0.1}

metalness={0.5}

/>

</mesh>

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—----

// components/HologramCube.jsx (Roadie now reacts to creative 3D prompts)

import React, { useRef, Suspense, useState } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, useGLTF, ContactShadows } from '@react-three/drei';

import * as THREE from 'three';

function Model({ path, position = [0, 1.5, 0], scale = 1 }) {

const { scene } = useGLTF(path);

return <primitive object={scene} position={position} scale={scale} />;

}

function RoadieAnimated({ gesture }) {

const groupRef = useRef();

const headRef = useRef();

const pulseRef = useRef();

const leftEyeRef = useRef();

const rightEyeRef = useRef();

const armRef = useRef();

const [blink, setBlink] = useState(false);

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

if (groupRef.current) {

groupRef.current.position.y = 1.5 + Math.sin(t * 2) * 0.05;

if (gesture === "nod") {

groupRef.current.rotation.x = Math.sin(t * 2) * 0.1;

}

}

if (headRef.current) {

headRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;

}

if (pulseRef.current) {

const scale = 1 + 0.05 * Math.sin(t * 3);

pulseRef.current.scale.set(scale, scale, scale);

}

const blinkCycle = t % 4;

setBlink(blinkCycle > 3.8 && blinkCycle < 4);

if (armRef.current && gesture === "wave") {

armRef.current.rotation.z = Math.sin(t * 5) * 0.5;

}

});

return (

<group ref={groupRef}>

<mesh ref={headRef} position={[0, 0.35, 0]}>

<sphereGeometry args={[0.22, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0077ff" emissiveIntensity={0.3} />

</mesh>

<mesh ref={leftEyeRef} position={[-0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

<mesh ref={rightEyeRef} position={[0.07, 0.42, 0.18]}>

<sphereGeometry args={[0.02, 16, 16]} />

<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={blink ? 0 : 1} transparent opacity={blink ? 0 : 1} />

</mesh>

<mesh ref={armRef} position={[0.22, 0.15, 0]}>

<boxGeometry args={[0.08, 0.2, 0.08]} />

<meshStandardMaterial color="#0b0b22" emissive="#3388ff" emissiveIntensity={0.5} />

</mesh>

<mesh position={[0, 0, 0]}>

<sphereGeometry args={[0.3, 32, 32]} />

<meshStandardMaterial color="#0b0b22" emissive="#0055ff" emissiveIntensity={0.2} />

</mesh>

<Html position={[0, 0.02, 0.31]} transform occlude>

<img src="/blackroad-logo.png" alt="Roadie Logo" style={{ width: '2rem', opacity: 0.95 }} />

</Html>

<mesh ref={pulseRef} position={[0, -0.3, 0]}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

</group>

);

}

function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: "model", path: "/models/pyramid.glb" };

if (q.includes("rocket")) return { type: "model", path: "/models/rocket.glb" };

if (q.includes("3 + 4") || q.includes("3+4")) return { type: "math", values: [3, 4] };

if (q.includes("roadie") && q.includes("wave")) return { type: "roadie", gesture: "wave" };

if (q.includes("roadie") && q.includes("nod")) return { type: "roadie", gesture: "nod" };

if (q.includes("roadie")) return { type: "roadie", gesture: null };

if (q.includes("draw") || q.includes("make") || q.includes("show")) {

if (q.includes("volcano")) return { type: "model", path: "/models/volcano.glb" };

if (q.includes("robot")) return { type: "model", path: "/models/robot.glb" };

if (q.includes("castle")) return { type: "model", path: "/models/castle.glb" };

}

return { type: "default" };

}

function ShapeSelector({ prompt }) {

const result = promptClassifier(prompt);

if (!result) return null;

if (result.type === "model") {

return (

<>

<Model path={result.path} scale={1.5} />

<PulseGlow position={[0, 1.2, 0]} />

</>

);

}

if (result.type === "math") {

return (

<group>

<PulseGlow position={[0, 1.2, 0]} />

{Array.from({ length: result.values[0] }, (_, i) => (

<mesh key={"a" + i} position={[-0.5 + i * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={1.2} />

</mesh>

))}

{Array.from({ length: result.values[1] }, (_, i) => (

<mesh key={"b" + i} position={[-0.5 + (result.values[0] + i) * 0.3, 1.5, 0]}>

<sphereGeometry args={[0.1, 32, 32]} />

<meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={1.2} />

</mesh>

))}

</group>

);

}

if (result.type === "roadie") {

return <RoadieAnimated gesture={result.gesture} />;

}

return (

<>

<PulseGlow position={[0, 1.2, 0]} />

<mesh position={[0, 1.5, 0]}>

<torusKnotGeometry args={[0.3, 0.1, 128, 16]} />

<meshStandardMaterial color="#00ffff" wireframe emissive="#00ffff" emissiveIntensity={1.5} />

</mesh>

</>

);

}

function PulseGlow({ position }) {

const meshRef = useRef();

useFrame(({ clock }) => {

const t = clock.getElapsedTime();

const scale = 1 + 0.05 * Math.sin(t * 3);

if (meshRef.current) meshRef.current.scale.set(scale, scale, scale);

});

return (

<mesh ref={meshRef} position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ prompt }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial

color="#ffffff"

transparent

opacity={0.04}

roughness={0.1}

metalness={0.5}

/>

</mesh>

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeSelector prompt={prompt} />

</Suspense>

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—

import BoxShape from '../components/Shapes/BoxShape';

import PyramidShape from '../components/Shapes/PyramidShape';

export const ShapeLibrary = {

box: BoxShape,

pyramid: PyramidShape,

stairs: StaircaseShape,

ring: RingShape

};

{ type: 'glb', path: '/models/house.glb' }

{ type: 'glb', path: '/models/house.glb' }

‘

// lib/shapeLibrary.js

import BoxShape from '../components/Shapes/BoxShape';

import PyramidShape from '../components/Shapes/PyramidShape';

import RingShape from '../components/Shapes/RingShape';

export const ShapeLibrary = {

box: BoxShape,

pyramid: PyramidShape,

ring: RingShape,

};

—--

// components/ShapeLoader.jsx

import React, { Suspense } from 'react';

import { useGLTF } from '@react-three/drei';

import { ShapeLibrary } from '../lib/shapeLibrary';

export default function ShapeLoader({ config }) {

if (!config) return null;

if (config.type === 'component' && ShapeLibrary[config.name]) {

const Component = ShapeLibrary[config.name];

return <Component {...config.props} />;

}

if (config.type === 'glb') {

return <GLBModel url={config.path} scale={config.scale || 1} />;

}

return null;

}

function GLBModel({ url, scale }) {

const { scene } = useGLTF(url);

return <primitive object={scene} scale={scale} position={[0, 1.5, 0]} />;

}

—--

​​// HologramCube.jsx (refactored to use ShapeLoader)

import React, { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

import ShapeLoader from './ShapeLoader';

function PulseGlow({ position }) {

return (

<mesh position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ config }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#ffffff" transparent opacity={0.04} roughness={0.1} metalness={0.5} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

<ShapeLoader config={config} />

</Suspense>

<PulseGlow position={[0, 1.2, 0]} />

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—-----

// utils/promptClassifier.js

export function promptClassifier(prompt) {

const q = prompt.toLowerCase();

if (!q) return null;

if (q.includes("pyramid")) return { type: 'glb', path: '/models/pyramid.glb', scale: 1.5 };

if (q.includes("rocket")) return { type: 'glb', path: '/models/rocket.glb', scale: 1.5 };

if (q.includes("cube")) return { type: 'component', name: 'box', props: { size: [1,1,1], color: '#888' } };

if (q.includes("ring")) return { type: 'component', name: 'ring', props: { radius: 0.5, color: '#ff00ff' } };

if (q.includes("draw") || q.includes("make") || q.includes("show")) {

if (q.includes("volcano")) return { type: 'glb', path: '/models/volcano.glb', scale: 1.5 };

if (q.includes("robot")) return { type: 'glb', path: '/models/robot.glb', scale: 1.2 };

if (q.includes("castle")) return { type: 'glb', path: '/models/castle.glb', scale: 2 };

}

return { type: 'component', name: 'box', props: { size: [1,1,1], color: '#aaa' } }; // default shape

}

—-----------

// App.jsx (Roadie Replica full integration)

import React, { useState, useEffect } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

import { promptClassifier } from './utils/promptClassifier';

function useSpeech(prompt, mute) {

useEffect(() => {

if (!prompt || mute) return;

let message = '';

const p = prompt.toLowerCase();

if (p.includes('3 + 4') || p.includes('3+4')) {

message = 'Three plus four is seven. Let me show you.';

} else if (p.includes('pyramid')) {

message = 'This is an ancient Egyptian pyramid, built over 4,000 years ago.';

} else if (p.includes('rocket')) {

message = 'Launching the holographic rocket.';

}

if (message) {

const utterance = new SpeechSynthesisUtterance(message);

window.speechSynthesis.speak(utterance);

}

}, [prompt, mute]);

}

export default function App() {

const [prompt, setPrompt] = useState('');

const [mute, setMute] = useState(false);

const config = promptClassifier(prompt);

useSpeech(prompt, mute);

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">

<div className="flex justify-center items-start w-full max-w-7xl gap-12">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<div className="flex flex-col items-end gap-4">

<button

onClick={() => setMute(!mute)}

className={`text-sm px-4 py-2 rounded-full font-semibold ${

mute ? 'bg-red-600' : 'bg-green-600'

}`}

>

{mute ? 'Unmute Roadie' : 'Mute Roadie'}

</button>

<HologramCube config={config} />

</div>

</div>

<div className="mt-12">

<Keyboard setPrompt={setPrompt} />

</div>

</div>

);

}

—-------

// App.jsx (now supports multiple objects in Roadie Replica)

import React, { useState, useEffect } from 'react';

import InputPanel from './components/InputPanel';

import HologramCube from './components/HologramCube';

import Keyboard from './components/Keyboard';

import { promptClassifier } from './utils/promptClassifier';

function useSpeech(prompt, mute) {

useEffect(() => {

if (!prompt || mute) return;

let message = '';

const p = prompt.toLowerCase();

if (p.includes('3 + 4') || p.includes('3+4')) {

message = 'Three plus four is seven. Let me show you.';

} else if (p.includes('pyramid')) {

message = 'This is an ancient Egyptian pyramid, built over 4,000 years ago.';

} else if (p.includes('rocket')) {

message = 'Launching the holographic rocket.';

}

if (message) {

const utterance = new SpeechSynthesisUtterance(message);

window.speechSynthesis.speak(utterance);

}

}, [prompt, mute]);

}

export default function App() {

const [prompt, setPrompt] = useState('');

const [mute, setMute] = useState(false);

const [sceneObjects, setSceneObjects] = useState([]);

useSpeech(prompt, mute);

useEffect(() => {

if (!prompt) return;

const config = promptClassifier(prompt);

if (config) {

setSceneObjects((prev) => [...prev, { id: Date.now(), ...config }]);

}

}, [prompt]);

return (

<div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">

<div className="flex justify-center items-start w-full max-w-7xl gap-12">

<InputPanel prompt={prompt} setPrompt={setPrompt} />

<div className="flex flex-col items-end gap-4">

<button

onClick={() => setMute(!mute)}

className={`text-sm px-4 py-2 rounded-full font-semibold ${

mute ? 'bg-red-600' : 'bg-green-600'

}`}

>

{mute ? 'Unmute Roadie' : 'Mute Roadie'}

</button>

<HologramCube sceneObjects={sceneObjects} />

</div>

</div>

<div className="mt-12">

<Keyboard setPrompt={setPrompt} />

</div>

</div>

);

}

—----

// HologramCube.jsx (renders full sceneObjects array)

import React, { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

import ShapeLoader from './ShapeLoader';

function PulseGlow({ position }) {

return (

<mesh position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ sceneObjects }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#ffffff" transparent opacity={0.04} roughness={0.1} metalness={0.5} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

{sceneObjects.map((obj, i) => (

<group key={obj.id} position={[i * 0.6 - 1.2, 1.5, 0]}>

<ShapeLoader config={obj} />

</group>

))}

</Suspense>

<PulseGlow position={[0, 1.2, 0]} />

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

</Canvas>

);

}

—----

// shaders/AstigmatismShader.js

export const AstigmatismShader = {

uniforms: {

tDiffuse: { value: null },

horizontalAmount: { value: 0.002 },

verticalAmount: { value: 0.001 },

resolution: { value: [1024, 1024] },

},

vertexShader: `

varying vec2 vUv;

void main() {

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`,

fragmentShader: `

uniform sampler2D tDiffuse;

uniform float horizontalAmount;

uniform float verticalAmount;

uniform vec2 resolution;

varying vec2 vUv;

void main() {

vec2 h = vec2(horizontalAmount, 0.0);

vec2 v = vec2(0.0, verticalAmount);

vec4 sum = texture2D(tDiffuse, vUv) * 0.5;

sum += texture2D(tDiffuse, vUv + h) * 0.25;

sum += texture2D(tDiffuse, vUv - h) * 0.25;

sum += texture2D(tDiffuse, vUv + v) * 0.25;

sum += texture2D(tDiffuse, vUv - v) * 0.25;

gl_FragColor = sum;

}

`

};

—------

// components/PostProcessing.jsx

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useFrame(() => composer.current?.render(), 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

</effectComposer>

);

}

—--------

// HologramCube.jsx (with astigmatism shader applied)

import React, { Suspense } from 'react';

import { Canvas } from '@react-three/fiber';

import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

import ShapeLoader from './ShapeLoader';

import PostProcessing from './PostProcessing';

function PulseGlow({ position }) {

return (

<mesh position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

export default function HologramCube({ sceneObjects }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#ffffff" transparent opacity={0.04} roughness={0.1} metalness={0.5} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

{sceneObjects.map((obj, i) => (

<group key={obj.id} position={[i * 0.6 - 1.2, 1.5, 0]}>

<ShapeLoader config={obj} />

</group>

))}

</Suspense>

<PulseGlow position={[0, 1.2, 0]} />

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

<PostProcessing />

</Canvas>

);

}

—--

// shaders/DispersionShader.js

export const DispersionShader = {

uniforms: {

tDiffuse: { value: null },

amount: { value: 0.003 },

resolution: { value: [1024, 1024] },

},

vertexShader: `

varying vec2 vUv;

void main() {

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`,

fragmentShader: `

uniform sampler2D tDiffuse;

uniform float amount;

uniform vec2 resolution;

varying vec2 vUv;

void main() {

vec2 offset = (vUv - 0.5) * amount;

float dx = offset.x;

float dy = offset.y;

vec4 color;

color.r = texture2D(tDiffuse, vUv + vec2(dx, dy)).r;

color.g = texture2D(tDiffuse, vUv).g;

color.b = texture2D(tDiffuse, vUv - vec2(dx, dy)).b;

color.a = 1.0;

gl_FragColor = color;

}

`

};

—---

// components/PostProcessing.jsx (adds dispersion after astigmatism)

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

import { DispersionShader } from '../shaders/DispersionShader';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useFrame(() => composer.current?.render(), 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

<shaderPass attach="passes" args={[DispersionShader]} />

</effectComposer>

);

}

—--

// components/PostProcessing.jsx (adds dispersion after astigmatism)

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

import { DispersionShader } from '../shaders/DispersionShader';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useFrame(() => composer.current?.render(), 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

<shaderPass attach="passes" args={[DispersionShader]} />

</effectComposer>

);

}

—-----

// components/PostProcessing.jsx (adds animated dispersion flicker)

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

import { DispersionShader } from '../shaders/DispersionShader';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

const dispersionPass = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useFrame(({ clock }) => {

composer.current?.render();

if (dispersionPass.current) {

dispersionPass.current.uniforms.amount.value = 0.002 + 0.001 * Math.sin(clock.getElapsedTime() * 4);

}

}, 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

<shaderPass ref={dispersionPass} attach="passes" args={[DispersionShader]} />

</effectComposer>

);

}

—--------

// shaders/ScanlineShader.js

export const ScanlineShader = {

uniforms: {

tDiffuse: { value: null },

time: { value: 0.0 },

intensity: { value: 0.05 }

},

vertexShader: `

varying vec2 vUv;

void main() {

vUv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}

`,

fragmentShader: `

uniform sampler2D tDiffuse;

uniform float time;

uniform float intensity;

varying vec2 vUv;

void main() {

vec2 uv = vUv;

uv.y += sin(uv.x * 40.0 + time * 5.0) * 0.002 * intensity;

float scan = sin(uv.y * 200.0 + time * 60.0) * intensity;

vec4 color = texture2D(tDiffuse, uv);

color.rgb += scan;

gl_FragColor = color;

}

`

};

—------------

// components/PostProcessing.jsx (adds scanline shader pass)

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

import { DispersionShader } from '../shaders/DispersionShader';

import { ScanlineShader } from '../shaders/ScanlineShader';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

const dispersionPass = useRef();

const scanlinePass = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useFrame(({ clock }) => {

composer.current?.render();

if (dispersionPass.current) {

dispersionPass.current.uniforms.amount.value = 0.002 + 0.001 * Math.sin(clock.getElapsedTime() * 4);

}

if (scanlinePass.current) {

scanlinePass.current.uniforms.time.value = clock.getElapsedTime();

}

}, 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

<shaderPass ref={dispersionPass} attach="passes" args={[DispersionShader]} />

<shaderPass ref={scanlinePass} attach="passes" args={[ScanlineShader]} />

</effectComposer>

);

}

—-

// shaders/BloomEffect.js

import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import { Vector2 } from 'three';

export function createBloomPass(resolution = new Vector2(1024, 1024)) {

const bloomPass = new UnrealBloomPass(resolution, 1.0, 0.4, 0.85);

bloomPass.threshold = 0.1;

bloomPass.strength = 1.25; // higher = brighter glow

bloomPass.radius = 0.55;

return bloomPass;

}

—-----

// components/PostProcessing.jsx (adds bloom pass)

import { useThree, extend, useFrame } from '@react-three/fiber';

import { useEffect, useRef } from 'react';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';

import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

import { AstigmatismShader } from '../shaders/AstigmatismShader';

import { DispersionShader } from '../shaders/DispersionShader';

import { ScanlineShader } from '../shaders/ScanlineShader';

import { createBloomPass } from '../shaders/BloomEffect';

extend({ EffectComposer, RenderPass, ShaderPass });

export default function PostProcessing() {

const { gl, scene, camera, size } = useThree();

const composer = useRef();

const dispersionPass = useRef();

const scanlinePass = useRef();

const bloomPass = useRef();

useEffect(() => {

composer.current.setSize(size.width, size.height);

}, [size]);

useEffect(() => {

if (!composer.current) return;

bloomPass.current = createBloomPass();

composer.current.addPass(bloomPass.current);

}, []);

useFrame(({ clock }) => {

composer.current?.render();

if (dispersionPass.current) {

dispersionPass.current.uniforms.amount.value = 0.002 + 0.001 * Math.sin(clock.getElapsedTime() * 4);

}

if (scanlinePass.current) {

scanlinePass.current.uniforms.time.value = clock.getElapsedTime();

}

if (bloomPass.current) {

bloomPass.current.strength = 1.2 + 0.1 * Math.sin(clock.getElapsedTime() * 3);

}

}, 1);

return (

<effectComposer ref={composer} args={[gl]}>

<renderPass attach="passes" args={[scene, camera]} />

<shaderPass attach="passes" args={[AstigmatismShader]} />

<shaderPass ref={dispersionPass} attach="passes" args={[DispersionShader]} />

<shaderPass ref={scanlinePass} attach="passes" args={[ScanlineShader]} />

</effectComposer>

);

}

—--

// HologramCube.jsx (adds volumetric projector cone)

import React, { Suspense, useRef, useEffect } from 'react';

import { Canvas, useFrame } from '@react-three/fiber';

import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';

import ShapeLoader from './ShapeLoader';

import PostProcessing from './PostProcessing';

function PulseGlow({ position }) {

return (

<mesh position={position}>

<ringGeometry args={[0.55, 0.65, 64]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} />

</mesh>

);

}

function ProjectorCone() {

const ref = useRef();

useFrame(({ clock }) => {

if (ref.current) {

ref.current.material.opacity = 0.1 + 0.05 * Math.sin(clock.getElapsedTime() * 2);

}

});

return (

<mesh ref={ref} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>

<coneGeometry args={[0.6, 1.5, 64, 1, true]} />

<meshBasicMaterial color="#00ffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={2} />

</mesh>

);

}

export default function HologramCube({ sceneObjects }) {

return (

<Canvas className="w-[500px] h-[500px]" camera={{ fov: 50, position: [0, 1, 5] }} shadows>

<ambientLight intensity={0.6} />

<pointLight position={[0, 5, 3]} intensity={2.0} color="#ffffff" />

<pointLight position={[0, -2, 2]} intensity={1.5} color="#00ccff" />

{/* Glass Cube */}

<mesh position={[0, 1.5, 0]} scale={[2, 2, 2]}>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#ffffff" transparent opacity={0.04} roughness={0.1} metalness={0.5} />

</mesh>

{/* Cube Base */}

<mesh position={[0, 0, 0]} scale={[2.2, 0.3, 2.2]} receiveShadow>

<boxGeometry args={[1, 1, 1]} />

<meshStandardMaterial color="#3a3a3a" metalness={0.4} roughness={0.4} />

<Html position={[0, 0, 0.51]} transform>

<img src="/blackroad-logo.png" alt="BlackRoad" style={{ width: '4rem' }} />

</Html>

</mesh>

<Suspense fallback={null}>

{sceneObjects.map((obj, i) => (

<group key={obj.id} position={[i * 0.6 - 1.2, 1.5, 0]}>

<ShapeLoader config={obj} />

</group>

))}

</Suspense>

<ProjectorCone />

<PulseGlow position={[0, 1.2, 0]} />

<ContactShadows position={[0, 0, 0]} opacity={0.4} scale={4} blur={2.5} far={2} />

<Environment preset="city" background={false} />

<OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />

<PostProcessing />

</Canvas>

);

}
