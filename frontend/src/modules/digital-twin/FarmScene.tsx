import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';

// Procedural plot representations for the baseline scene
const DemoPlotMesh: React.FC<{
  position: [number, number, number];
  size: [number, number];
  color: string;
  name: string;
  crop: string;
}> = ({ position, size, color, name, crop }) => {
  return (
    <group position={position}>
      {/* Field Plot Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Boundary Wireframe */}
      <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(size[0], size[1])]} />
        <lineBasicMaterial color="#ffffff" linewidth={2} />
      </lineSegments>

      {/* Field Label */}
      <Text
        position={[0, 0.4, 0]}
        rotation={[-Math.PI / 3, 0, 0]}
        fontSize={0.4}
        color="#1e293b"
        anchorX="center"
        anchorY="middle"
      >
        {`${name}\n(${crop})`}
      </Text>
    </group>
  );
};

export const FarmScene: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[460px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100 to-emerald-50 border border-slate-200 shadow-inner relative">
      <Canvas
        shadows
        camera={{ position: [12, 14, 16], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        {/* Orbit Controls with bounded angles */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} // Prevent going below ground
          minDistance={6}
          maxDistance={35}
        />

        {/* Base Infinite Grid */}
        <Grid
          args={[30, 30]}
          cellSize={1}
          cellThickness={1}
          cellColor="#cbd5e1"
          sectionSize={5}
          sectionThickness={1.5}
          sectionColor="#94a3b8"
          fadeDistance={30}
          fadeStrength={1}
        />

        {/* Ground Terrain Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[26, 26]} />
          <meshStandardMaterial color="#e2ebd8" roughness={0.9} />
        </mesh>

        {/* Demo Farm Plots (North, Central, South) */}
        <DemoPlotMesh
          position={[-4, 0.02, -3]}
          size={[6, 5]}
          color="#a3c48f"
          name="North Plot"
          crop="Maize"
        />
        <DemoPlotMesh
          position={[3.5, 0.02, -2]}
          size={[7, 6]}
          color="#c8dcaf"
          name="Central Plot"
          crop="Soybean"
        />
        <DemoPlotMesh
          position={[0, 0.02, 5]}
          size={[10, 5]}
          color="#b5d19e"
          name="South Plot"
          crop="Paddy"
        />

        {/* Farmhouse Model Placeholder */}
        <group position={[-8, 0, 6]}>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[2, 1.5, 2]} />
            <meshStandardMaterial color="#d97706" />
          </mesh>
          <mesh position={[0, 1.9, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.8, 1, 4]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          <Text position={[0, 2.7, 0]} fontSize={0.35} color="#1e293b" anchorX="center">
            Farmhouse
          </Text>
        </group>
      </Canvas>

      {/* Floating 3D Controls Legend */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 text-xs shadow-sm pointer-events-none">
        <div className="font-bold text-forest-900 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Three.js WebGL Scene (React Three Fiber)
        </div>
        <p className="text-slate-500 text-[10px] mt-0.5">
          Left Click + Drag: Rotate · Right Click + Drag: Pan · Scroll: Zoom
        </p>
      </div>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-sm pointer-events-none">
        Member 1 3D Foundation · Real Three.js Canvas
      </div>
    </div>
  );
};
