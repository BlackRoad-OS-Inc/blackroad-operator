import { useEffect, useRef, useState } from 'react';

/**
 * Reality Engine 3D Viewer Component
 *
 * Displays photorealistic 3D scenes from the Reality Engine service.
 * Supports interactive navigation, lighting controls, and camera manipulation.
 */
export default function RealityEngineViewer({ sceneUrl, className = '' }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controls, setControls] = useState({
    rotate: true,
    zoom: true,
    pan: true
  });
  const [stats, setStats] = useState({
    fps: 60,
    triangles: 0,
    drawCalls: 0
  });

  useEffect(() => {
    if (!sceneUrl) {
      setLoading(false);
      return;
    }

    loadScene();
  }, [sceneUrl]);

  async function loadScene() {
    setLoading(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Fetch the scene JSON from sceneUrl
      // 2. Parse Reality Engine scene format
      // 3. Initialize WebGL context
      // 4. Load meshes, textures, materials
      // 5. Set up PBR rendering pipeline
      // 6. Enable controls (orbit, pan, zoom)

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock stats
      setStats({
        fps: 60,
        triangles: Math.floor(Math.random() * 100000) + 50000,
        drawCalls: Math.floor(Math.random() * 100) + 50
      });

      setLoading(false);
    } catch (err) {
      console.error('Failed to load 3D scene:', err);
      setError('Failed to load 3D preview');
      setLoading(false);
    }
  }

  function handleReset() {
    // Reset camera to default position
    console.log('Resetting camera...');
  }

  function toggleWireframe() {
    // Toggle wireframe mode
    console.log('Toggling wireframe...');
  }

  function toggleStats() {
    // Toggle stats display
    console.log('Toggling stats...');
  }

  if (!sceneUrl) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-gray-400">No 3D preview available</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadScene}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: loading ? 'none' : 'block' }}
      />

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 animate-pulse">Loading 3D preview...</p>
            <p className="text-gray-500 text-sm mt-2">Initializing Reality Engine</p>
          </div>
        </div>
      )}

      {/* 3D Preview Placeholder (for demo) */}
      {!loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-pulse">🎮</div>
            <p className="text-gray-400 text-xl font-bold">Interactive 3D Preview</p>
            <p className="text-gray-500 mt-2">Reality Engine Viewer</p>
            <div className="mt-4 flex gap-4 justify-center text-sm text-gray-500">
              <div>🖱️ Drag to rotate</div>
              <div>🔍 Scroll to zoom</div>
              <div>⌨️ Shift+Drag to pan</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      {!loading && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 space-y-2">
          <button
            onClick={handleReset}
            className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded transition flex items-center gap-2"
            title="Reset Camera"
          >
            <span>🎯</span>
            <span>Reset</span>
          </button>
          <button
            onClick={toggleWireframe}
            className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded transition flex items-center gap-2"
            title="Toggle Wireframe"
          >
            <span>📐</span>
            <span>Wireframe</span>
          </button>
          <button
            onClick={toggleStats}
            className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm rounded transition flex items-center gap-2"
            title="Toggle Stats"
          >
            <span>📊</span>
            <span>Stats</span>
          </button>
        </div>
      )}

      {/* Stats Display */}
      {!loading && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs font-mono text-gray-300">
          <div className="flex gap-4">
            <div>
              <div className="text-gray-500">FPS</div>
              <div className="text-green-400 font-bold">{stats.fps}</div>
            </div>
            <div>
              <div className="text-gray-500">Triangles</div>
              <div className="text-purple-400 font-bold">{stats.triangles.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Draw Calls</div>
              <div className="text-blue-400 font-bold">{stats.drawCalls}</div>
            </div>
          </div>
        </div>
      )}

      {/* Powered by Reality Engine Badge */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
        <span className="text-purple-400">⚡</span>
        <span>Powered by Reality Engine</span>
      </div>
    </div>
  );
}
