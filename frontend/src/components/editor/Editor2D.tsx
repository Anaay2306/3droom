"use client";

import React, { useRef, useState, useEffect } from "react";
import { useStore } from "../../store/useStore";
import { Point2D, FurnitureItem, Wall, RoomOpening } from "../../types";

export function Editor2D() {
  const { 
    project, 
    selectedItemId, 
    selectedWallId, 
    selectedOpeningId,
    selectItem, 
    selectWall, 
    selectOpening,
    updateItem, 
    updateWall, 
    addWall, 
    deleteWall,
    deleteItem,
    addOpening,
    addItem,
    pushHistory
  } = useStore();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point2D>({ x: 400, y: 300 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingWallStart, setDrawingWallStart] = useState<Point2D | null>(null);
  const [mousePos, setMousePos] = useState<Point2D>({ x: 0, y: 0 });
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point2D>({ x: 0, y: 0 });
  const [rotatingItemId, setRotatingItemId] = useState<string | null>(null);
  const [initialRotAngle, setInitialRotAngle] = useState<number>(0);
  const [initialItemRotation, setInitialItemRotation] = useState<number>(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Convert screen coordinates to world coordinates
  const screenToWorld = (screenX: number, screenY: number): Point2D => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - pan.x) / (50 * zoom);
    const y = (screenY - rect.top - pan.y) / (50 * zoom);
    return { x, y };
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number): Point2D => {
    const x = worldX * 50 * zoom + pan.x;
    const y = worldY * 50 * zoom + pan.y;
    return { x, y };
  };

  // Snap value to grid if enabled
  const snapToGrid = (val: number, size: number): number => {
    return Math.round(val / size) * size;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const worldCoords = screenToWorld(e.clientX, e.clientY);
    const gridCoords = {
      x: project.settings.gridSnap ? snapToGrid(worldCoords.x, project.settings.gridSize) : worldCoords.x,
      y: project.settings.gridSnap ? snapToGrid(worldCoords.y, project.settings.gridSize) : worldCoords.y,
    };

    if (e.button === 1 || e.shiftKey) { // Middle click or shift pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (isDrawingMode) {
      if (!drawingWallStart) {
        // First click sets the start point of the wall
        setDrawingWallStart(gridCoords);
      } else {
        // Second click finalizes the current wall segment
        addWall({
          start: drawingWallStart,
          end: gridCoords,
          thickness: project.settings.wallThickness,
          height: project.settings.wallHeight
        });
        if (e.ctrlKey) {
          // Continue drawing next segment from this end point
          setDrawingWallStart(gridCoords);
        } else {
          setDrawingWallStart(null);
          setIsDrawingMode(false);
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const worldCoords = screenToWorld(e.clientX, e.clientY);
    const gridCoords = {
      x: project.settings.gridSnap ? snapToGrid(worldCoords.x, project.settings.gridSize) : worldCoords.x,
      y: project.settings.gridSnap ? snapToGrid(worldCoords.y, project.settings.gridSize) : worldCoords.y,
    };
    
    setMousePos(gridCoords);

    if (draggingItemId) {
      let targetX = worldCoords.x - dragOffset.x;
      let targetZ = worldCoords.y - dragOffset.y;
      if (project.settings.gridSnap) {
        targetX = snapToGrid(targetX, project.settings.gridSize);
        targetZ = snapToGrid(targetZ, project.settings.gridSize);
      }
      updateItem(draggingItemId, { x: targetX, z: targetZ });
    } else if (rotatingItemId) {
      const item = project.scene.items.find(i => i.id === rotatingItemId);
      if (item) {
        const currentAngle = Math.atan2(worldCoords.y - item.z, worldCoords.x - item.x);
        const deltaAngle = currentAngle - initialRotAngle;
        let newRotation = initialItemRotation + Math.round((deltaAngle * 180) / Math.PI);
        if (project.settings.gridSnap) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        updateItem(rotatingItemId, { rotation: newRotation });
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (draggingItemId) {
      setDraggingItemId(null);
      pushHistory();
    }
    if (rotatingItemId) {
      setRotatingItemId(null);
      pushHistory();
    }
  };

  const handleItemMouseDown = (e: React.MouseEvent, item: FurnitureItem) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click
    selectItem(item.id);
    setDraggingItemId(item.id);
    const worldCoords = screenToWorld(e.clientX, e.clientY);
    setDragOffset({
      x: worldCoords.x - item.x,
      y: worldCoords.y - item.z
    });
  };

  const handleRotateMouseDown = (e: React.MouseEvent, item: FurnitureItem) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return; // Only left click
    selectItem(item.id);
    setRotatingItemId(item.id);
    const worldCoords = screenToWorld(e.clientX, e.clientY);
    const angle = Math.atan2(worldCoords.y - item.z, worldCoords.x - item.x);
    setInitialRotAngle(angle);
    setInitialItemRotation(item.rotation);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      const asset = JSON.parse(dataStr);
      if (!asset || !asset.name) return; // not a catalog asset
      
      const worldCoords = screenToWorld(e.clientX, e.clientY);
      const targetX = project.settings.gridSnap ? snapToGrid(worldCoords.x, project.settings.gridSize) : worldCoords.x;
      const targetZ = project.settings.gridSnap ? snapToGrid(worldCoords.y, project.settings.gridSize) : worldCoords.y;
      
      addItem({
        catalogId: asset.name.toLowerCase().replace(/ /g, "_"),
        name: asset.name,
        category: asset.category,
        x: targetX,
        y: 0,
        z: targetZ,
        rotation: 0,
        width: asset.width,
        height: asset.height,
        depth: asset.depth,
        color: asset.defaultColor,
        material: asset.defaultMaterial,
        price: asset.price
      });
    } catch (err) {
      console.error("Drop error", err);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    setZoom(Math.min(Math.max(newZoom, 0.1), 10));
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full bg-slate-900 overflow-hidden cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Canvas Layer */}
      <svg 
        className="w-full h-full"
        onClick={() => {
          selectItem(null);
          selectWall(null);
          selectOpening(null);
        }}
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={50 * zoom} height={50 * zoom} patternUnits="userSpaceOnUse">
            <path d={`M ${50 * zoom} 0 L 0 0 0 ${50 * zoom}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Origin Axes */}
        <line x1={0} y1={pan.y} x2={2000} y2={pan.y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1={pan.x} y1={0} x2={pan.x} y2={2000} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Walls */}
        {project.scene.walls.map((wall) => {
          const s = worldToScreen(wall.start.x, wall.start.y);
          const e = worldToScreen(wall.end.x, wall.end.y);
          const isSelected = selectedWallId === wall.id;
          const wallColor = wall.color || project.scene.wall_color || "#E5E7EB";
          return (
            <g key={wall.id} onClick={(ev) => { ev.stopPropagation(); selectWall(wall.id); }}>
              {/* Outer Selection Highlight Outline */}
              {isSelected && (
                <line 
                  x1={s.x} y1={s.y} x2={e.x} y2={e.y} 
                  stroke="#0ea5e9" 
                  strokeWidth={wall.thickness * 50 * zoom + 6} 
                  strokeLinecap="round"
                  opacity={0.65}
                />
              )}
              {/* Main Wall Solid Line */}
              <line 
                x1={s.x} y1={s.y} x2={e.x} y2={e.y} 
                stroke={wallColor} 
                strokeWidth={wall.thickness * 50 * zoom} 
                strokeLinecap="round"
                className="transition-colors duration-150 hover:opacity-80 cursor-pointer"
              />
              {/* Length label */}
              <text 
                x={(s.x + e.x) / 2} 
                y={(s.y + e.y) / 2 - 10} 
                fill="#9CA3AF"
                fontSize="11" 
                textAnchor="middle"
                className="bg-slate-900 pointer-events-none select-none"
              >
                {Math.sqrt(Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2)).toFixed(2)}m
              </text>
            </g>
          );
        })}

        {/* Furniture Items */}
        {project.scene.items.map((item) => {
          const screenPos = worldToScreen(item.x, item.z); // R3F Z maps to 2D Canvas Y coordinate
          const isSelected = selectedItemId === item.id;
          const w = item.width * 50 * zoom;
          const d = item.depth * 50 * zoom;
          
          return (
            <g 
              key={item.id} 
              transform={`translate(${screenPos.x}, ${screenPos.y}) rotate(${item.rotation})`}
              onMouseDown={(ev) => handleItemMouseDown(ev, item)}
              onClick={(ev) => ev.stopPropagation()}
              className="cursor-move"
            >
              <rect
                x={-w / 2}
                y={-d / 2}
                width={w}
                height={d}
                fill={isSelected ? "rgba(14, 165, 233, 0.2)" : "rgba(255, 255, 255, 0.15)"}
                stroke={isSelected ? "#0ea5e9" : "#9CA3AF"}
                strokeWidth="1.5"
                rx="2"
              />
              <text 
                x="0" 
                y="4" 
                fill="#E5E7EB" 
                fontSize="9" 
                textAnchor="middle"
                className="pointer-events-none select-none"
              >
                {item.name}
              </text>
              {isSelected && (
                <g onMouseDown={(ev) => handleRotateMouseDown(ev, item)} onClick={(ev) => ev.stopPropagation()}>
                  <line 
                    x1={0} y1={-d / 2} 
                    x2={0} y2={-d / 2 - 15} 
                    stroke="#0ea5e9" 
                    strokeWidth="1.5" 
                  />
                  <circle 
                    cx={0} cy={-d / 2 - 15} 
                    r="4.5" 
                    fill="#0ea5e9" 
                    className="cursor-alias hover:scale-125 transition-transform" 
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Openings (Doors/Windows) */}
        {project.scene.openings.map((op) => {
          const wall = project.scene.walls.find(w => w.id === op.wallId);
          if (!wall) return null;
          
          // Calculate exact world coordinates along the wall
          const dx = wall.end.x - wall.start.x;
          const dy = wall.end.y - wall.start.y;
          const wallLength = Math.sqrt(dx*dx + dy*dy);
          if (wallLength === 0) return null;
          
          const uX = dx / wallLength;
          const uY = dy / wallLength;
          const worldX = wall.start.x + uX * op.distance;
          const worldY = wall.start.y + uY * op.distance;
          
          const screenPos = worldToScreen(worldX, worldY);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const isSelected = selectedOpeningId === op.id;

          const w = op.width * 50 * zoom;
          const thickness = wall.thickness * 60 * zoom;

          return (
            <g
              key={op.id}
              transform={`translate(${screenPos.x}, ${screenPos.y}) rotate(${angle})`}
              onClick={(ev) => { ev.stopPropagation(); selectOpening(op.id); }}
              className="cursor-pointer"
            >
              <rect
                x={-w / 2}
                y={-thickness / 2}
                width={w}
                height={thickness}
                fill={isSelected ? "#E11D48" : op.type === "door" ? "#3B82F6" : "#06B6D4"}
                stroke={isSelected ? "#FFF" : "none"}
                strokeWidth="1"
              />
              {op.type === "door" && (
                <path
                  d={`M ${-w/2} 0 A ${w} ${w} 0 0 1 ${w/2} 0`}
                  fill="none"
                  stroke="#3B82F6"
                  strokeDasharray="2,2"
                />
              )}
            </g>
          );
        })}

        {/* Drafting Wall Segment Preview */}
        {drawingWallStart && (
          <g>
            <line 
              x1={worldToScreen(drawingWallStart.x, drawingWallStart.y).x} 
              y1={worldToScreen(drawingWallStart.x, drawingWallStart.y).y} 
              x2={worldToScreen(mousePos.x, mousePos.y).x} 
              y2={worldToScreen(mousePos.x, mousePos.y).y} 
              stroke="#F59E0B" 
              strokeWidth={project.settings.wallThickness * 50 * zoom} 
              strokeDasharray="4,4"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Editor Toolbox HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-row gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-2xl">
        <button 
          onClick={() => {
            if (isDrawingMode) {
              setIsDrawingMode(false);
              setDrawingWallStart(null);
            } else {
              setIsDrawingMode(true);
              setDrawingWallStart(null);
            }
          }}
          className={`px-3 py-1 text-xs font-semibold rounded ${isDrawingMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
        >
          {isDrawingMode ? (drawingWallStart ? "Drawing Wall..." : "Click to Start Wall") : "Draw Wall"}
        </button>
        {isDrawingMode && (
          <button 
            onClick={() => {
              setIsDrawingMode(false);
              setDrawingWallStart(null);
            }}
            className="px-2 py-1 text-xs font-semibold bg-red-600 hover:bg-red-500 rounded text-white"
          >
            Cancel
          </button>
        )}
        <button 
          onClick={() => {
            // Reset Pan & Zoom
            setZoom(1);
            setPan({ x: 400, y: 300 });
          }}
          className="px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded text-white"
        >
          Reset View
        </button>
      </div>
    </div>
  );
}
