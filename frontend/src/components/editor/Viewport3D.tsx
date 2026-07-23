"use client";

import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera, TransformControls } from "@react-three/drei";
import { useStore } from "../../store/useStore";
import * as THREE from "three";
import { Wall, RoomOpening, FurnitureItem } from "../../types";

// Individual wall segment component in 3D
function Wall3D({ start, end, thickness, height, color, finish }: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness: number;
  height: number;
  color?: string;
  finish?: "Matte" | "Satin" | "Gloss";
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

  const roughness = finish === "Gloss" ? 0.2 : finish === "Satin" ? 0.55 : 0.9;
  const metalness = finish === "Gloss" ? 0.25 : finish === "Satin" ? 0.1 : 0.05;

  return (
    <mesh position={[cx, cy, cz]} rotation={[0, angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial 
        color={color || "#F3F4F6"} 
        roughness={roughness} 
        metalness={metalness}
      />
    </mesh>
  );
}

// Transformable Furniture Component that integrates selection and 3D gizmos
function TransformableFurnitureItem3D({
  item,
  isSelected,
  selectItem,
  updateItem,
  pushHistory,
  setOrbitEnabled,
  transformMode
}: {
  item: FurnitureItem;
  isSelected: boolean;
  selectItem: (id: string | null) => void;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  pushHistory: () => void;
  setOrbitEnabled: (enabled: boolean) => void;
  transformMode: "translate" | "rotate";
}) {
  const groupRef = useRef<any>(null);
  const { project } = useStore();
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const dragOffset = useRef(new THREE.Vector3());

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

  // Pointer dragging handlers
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only drag with left click
    
    selectItem(item.id);
    setIsPointerDragging(true);
    setOrbitEnabled(false);

    // Get cursor intersection on floor plane at item height
    const intersectionPoint = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -item.y);
    e.ray.intersectPlane(plane, intersectionPoint);
    
    // Calculate offset from item center
    dragOffset.current.copy(intersectionPoint).sub(new THREE.Vector3(item.x, item.y, item.z));
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: any) => {
    if (!isPointerDragging) return;
    e.stopPropagation();

    const intersectionPoint = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -item.y);
    e.ray.intersectPlane(plane, intersectionPoint);

    let targetX = intersectionPoint.x - dragOffset.current.x;
    let targetZ = intersectionPoint.z - dragOffset.current.z;

    const gridSnap = project.settings.gridSnap;
    const gridSize = project.settings.gridSize;

    if (gridSnap) {
      targetX = Math.round(targetX / gridSize) * gridSize;
      targetZ = Math.round(targetZ / gridSize) * gridSize;
    }

    updateItem(item.id, {
      x: Number(targetX.toFixed(3)),
      z: Number(targetZ.toFixed(3))
    });
  };

  const handlePointerUp = (e: any) => {
    if (!isPointerDragging) return;
    e.stopPropagation();
    setIsPointerDragging(false);
    setOrbitEnabled(true);
    e.target.releasePointerCapture(e.pointerId);
    pushHistory();
  };

  const itemMesh = (
    <group 
      ref={groupRef}
      position={[item.x, item.y, item.z]} 
      rotation={[0, rotRad, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
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

  return (
    <group>
      {isSelected && !isPointerDragging && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          onPointerDown={() => setOrbitEnabled(false)}
          onPointerUp={() => {
            setOrbitEnabled(true);
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const rot = groupRef.current.rotation;
              updateItem(item.id, {
                x: Number(pos.x.toFixed(3)),
                y: Number(pos.y.toFixed(3)),
                z: Number(pos.z.toFixed(3)),
                rotation: Math.round((rot.y * 180) / Math.PI)
              });
            }
            pushHistory();
          }}
        />
      )}
      {itemMesh}
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
  const { project, selectedItemId, selectItem, updateItem, pushHistory } = useStore();
  const scene = project.scene;
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [transformMode, setTransformMode] = useState<"translate" | "rotate">("translate");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "SELECT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }
      if (e.key.toLowerCase() === "t") {
        setTransformMode("translate");
      } else if (e.key.toLowerCase() === "r") {
        setTransformMode("rotate");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine floor style based on materials or custom hex colors
  let floorColor = "#D1D5DB";
  let floorRoughness = 0.8;
  let floorMetalness = 0.1;

  if (scene.floor_color) {
    floorColor = scene.floor_color;
  } else {
    switch (scene.floor_material) {
      case "light_oak_wood":
        floorColor = "#E5C29B";
        floorRoughness = 0.6;
        break;
      case "walnut_wood":
        floorColor = "#5C4033";
        floorRoughness = 0.55;
        break;
      case "concrete_gray":
        floorColor = "#8A8A8A";
        floorRoughness = 0.8;
        break;
      case "gray_carpet":
        floorColor = "#A1A1AA";
        floorRoughness = 0.95;
        break;
      case "marble_white":
        floorColor = "#F3F4F6";
        floorRoughness = 0.15;
        floorMetalness = 0.3;
        break;
      case "dark_tiles":
        floorColor = "#2D3748";
        floorRoughness = 0.25;
        floorMetalness = 0.2;
        break;
      default:
        floorColor = "#D1D5DB";
    }
  }

  return (
    <div 
      className="w-full h-full bg-slate-950 relative"
      onClick={() => {
        // Deselect when clicking empty viewport overlay
        selectItem(null);
      }}
    >
      <Canvas shadows onClick={(e) => e.stopPropagation()}>
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
            color={floorColor} 
            roughness={floorRoughness}
            metalness={floorMetalness}
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
            color={wall.color || scene.wall_color}
            finish={scene.wall_finish}
          />
        ))}

        {/* Openings */}
        {scene.openings.map((op: RoomOpening) => {
          const matchingWall = scene.walls.find(w => w.id === op.wallId);
          return <Opening3D key={op.id} op={op} wall={matchingWall} />;
        })}

        {/* Furniture Items */}
        {scene.items.map((item: FurnitureItem) => (
          <TransformableFurnitureItem3D 
            key={item.id} 
            item={item} 
            isSelected={selectedItemId === item.id} 
            selectItem={selectItem}
            updateItem={updateItem}
            pushHistory={pushHistory}
            setOrbitEnabled={setOrbitEnabled}
            transformMode={transformMode}
          />
        ))}

        <OrbitControls makeDefault minDistance={2} maxDistance={25} maxPolarAngle={Math.PI / 2 - 0.05} enabled={orbitEnabled} />
      </Canvas>

      {/* 3D Mode Overlays with transform controls */}
      <div 
        className="absolute top-4 right-4 flex flex-row items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-2xl text-xs font-semibold text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-slate-400 mr-1">3D Controls:</span>
        <button
          onClick={() => setTransformMode("translate")}
          className={`px-2 py-1 rounded transition ${transformMode === "translate" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 hover:bg-slate-850 text-slate-350"}`}
        >
          Move (T)
        </button>
        <button
          onClick={() => setTransformMode("rotate")}
          className={`px-2 py-1 rounded transition ${transformMode === "rotate" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 hover:bg-slate-850 text-slate-350"}`}
        >
          Rotate (R)
        </button>
        <div className="h-4 w-px bg-slate-800 mx-1" />
        <span className="text-slate-400 font-normal">
          {selectedItemId ? "Gizmo active" : "Select object to move"}
        </span>
      </div>
    </div>
  );
}
