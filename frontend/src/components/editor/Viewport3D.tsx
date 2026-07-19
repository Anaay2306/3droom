"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { useStore } from "../../store/useStore";
import * as THREE from "three";
import { Wall, RoomOpening, FurnitureItem } from "../../types";

// Individual wall segment component in 3D
function Wall3D({ start, end, thickness, height, color }: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness: number;
  height: number;
  color?: string;
}) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return null;

  // Calculate center position
  const cx = (start.x + end.x) / 2;
  const cz = (start.y + end.y) / 2;
  const cy = height / 2;

  // Calculate rotation angle around Y axis
  const angle = -Math.atan2(dy, dx);

  return (
    <mesh position={[cx, cy, cz]} rotation={[0, angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial 
        color={color || "#F3F4F6"} 
        roughness={0.7} 
        metalness={0.1}
      />
    </mesh>
  );
}

// Furniture model placeholder/mesh component in 3D
function FurnitureItem3D({ item, isSelected }: {
  item: any;
  isSelected: boolean;
}) {
  // Convert 2D rotation to radians
  const rotRad = (item.rotation * Math.PI) / 180;

  // Map category to basic mock geometry styles for previewing
  let geometry = <boxGeometry args={[item.width, item.height, item.depth]} />;
  let color = item.color || "#A1A1AA";
  
  if (item.category === "decor") {
    // Cylinder for plant pots
    geometry = <cylinderGeometry args={[item.width/2, item.width/2, item.height, 16]} />;
  } else if (item.category === "lighting") {
    // Spheres
    geometry = <sphereGeometry args={[item.width/2, 16, 16]} />;
  }

  return (
    <group position={[item.x, item.y, item.z]} rotation={[0, rotRad, 0]}>
      <mesh castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial 
          color={color} 
          roughness={item.material === "fabric" ? 0.9 : item.material === "wood" ? 0.6 : 0.2}
          metalness={item.material === "metal" ? 0.8 : 0.1}
        />
      </mesh>
      {/* Selected highlighted outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[item.width + 0.05, item.height + 0.05, item.depth + 0.05]} />
          <meshBasicMaterial color="#0ea5e9" wireframe />
        </mesh>
      )}
    </group>
  );
}

// Room Opening component in 3D
function Opening3D({ op, wall }: { op: any; wall: any }) {
  if (!wall) return null;
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const wallLength = Math.sqrt(dx*dx + dy*dy);
  if (wallLength === 0) return null;

  const uX = dx / wallLength;
  const uY = dy / wallLength;
  
  // Calculate relative world coordinates
  const worldX = wall.start.x + uX * op.distance;
  const worldZ = wall.start.y + uY * op.distance;
  const worldY = op.height / 2; // Sitting directly on the floor
  
  const angle = -Math.atan2(dy, dx);
  const color = op.type === "door" ? "#3B82F6" : "#06B6D4";

  return (
    <mesh position={[worldX, worldY, worldZ]} rotation={[0, angle, 0]}>
      <boxGeometry args={[op.width, op.height, wall.thickness + 0.02]} />
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.4} 
        roughness={0.1} 
        metalness={0.9} 
      />
    </mesh>
  );
}

export function Viewport3D() {
  const { project, selectedItemId } = useStore();
  const scene = project.scene;

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 6, 8]} fov={50} />
        
        {/* Lights */}
        {scene.lights.map((light: any) => {
          if (light.type === "ambient") {
            return <ambientLight key={light.id} color={light.color} intensity={light.intensity} />;
          }
          if (light.type === "directional") {
            return (
              <directionalLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={[light.position.x, light.position.y, light.position.z]}
                castShadow={light.castShadows}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
            );
          }
          if (light.type === "point") {
            return (
              <pointLight
                key={light.id}
                color={light.color}
                intensity={light.intensity}
                position={[light.position.x, light.position.y, light.position.z]}
                castShadow={light.castShadows}
              />
            );
          }
          return null;
        })}

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial 
            color={scene.floor_material === "light_oak_wood" ? "#E5C29B" : scene.floor_material === "concrete_gray" ? "#8A8A8A" : "#D1D5DB"} 
            roughness={0.8}
          />
        </mesh>

        {/* Outer floor grid */}
        <Grid 
          renderOrder={-1} 
          position={[0, -0.005, 0]} 
          args={[30, 30]} 
          cellSize={1.0} 
          cellThickness={1} 
          cellColor="#334155" 
          sectionSize={5.0} 
          sectionThickness={1.5} 
          sectionColor="#475569" 
          fadeDistance={30}
        />

        {/* Walls */}
        {scene.walls.map((wall: Wall) => (
          <Wall3D 
            key={wall.id} 
            start={wall.start} 
            end={wall.end} 
            thickness={wall.thickness} 
            height={wall.height} 
            color={scene.wall_color}
          />
        ))}

        {/* Openings */}
        {scene.openings.map((op: RoomOpening) => {
          const matchingWall = scene.walls.find(w => w.id === op.wallId);
          return <Opening3D key={op.id} op={op} wall={matchingWall} />;
        })}

        {/* Furniture Items */}
        {scene.items.map((item: FurnitureItem) => (
          <FurnitureItem3D 
            key={item.id} 
            item={item} 
            isSelected={selectedItemId === item.id} 
          />
        ))}

        <OrbitControls makeDefault minDistance={2} maxDistance={25} maxPolarAngle={Math.PI / 2 - 0.05} />
      </Canvas>

      {/* 3D Mode Overlays */}
      <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-white">
        Orbit Mode
      </div>
    </div>
  );
}
