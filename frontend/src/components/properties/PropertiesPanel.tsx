"use client";

import React from "react";
import { useStore } from "../../store/useStore";

export function PropertiesPanel() {
  const {
    project,
    selectedItemId,
    selectedWallId,
    selectedOpeningId,
    updateItem,
    updateWall,
    updateOpening,
    deleteItem,
    deleteWall,
    deleteOpening,
    duplicateItem,
    updateScene,
    updateSettings
  } = useStore();

  const selectedItem = project.scene.items.find((i) => i.id === selectedItemId);
  const selectedWall = project.scene.walls.find((w) => w.id === selectedWallId);
  const selectedOpening = project.scene.openings.find((o) => o.id === selectedOpeningId);

  // Calculate dynamic wall length and endpoints
  let wallLength = 0;
  if (selectedWall) {
    const dx = selectedWall.end.x - selectedWall.start.x;
    const dy = selectedWall.end.y - selectedWall.start.y;
    wallLength = Math.sqrt(dx * dx + dy * dy);
  }

  const handleLengthChange = (newLen: number) => {
    if (!selectedWall || newLen <= 0) return;
    const dx = selectedWall.end.x - selectedWall.start.x;
    const dy = selectedWall.end.y - selectedWall.start.y;
    const currentLen = Math.sqrt(dx * dx + dy * dy);
    if (currentLen === 0) return;

    const ux = dx / currentLen;
    const uy = dy / currentLen;

    updateWall(selectedWall.id, {
      end: {
        x: selectedWall.start.x + ux * newLen,
        y: selectedWall.start.y + uy * newLen,
      },
    });
  };

  // If no element is selected, display global room / scene settings
  if (!selectedItem && !selectedWall && !selectedOpening) {
    return (
      <div className="w-full h-full bg-slate-950 border-l border-slate-800 flex flex-col text-slate-200">
        <div className="p-4 border-b border-slate-800 flex flex-row justify-between items-center bg-slate-900/50">
          <h3 className="font-bold text-sm tracking-wider uppercase text-sky-400">Room Settings</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none">
          {/* Global Wall Paint */}
          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase">Global Wall Color</label>
            <div className="flex flex-row items-center gap-2 mt-1">
              <input
                type="color"
                value={project.scene.wall_color || "#F3F4F6"}
                onChange={(e) => updateScene({ wall_color: e.target.value })}
                className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={project.scene.wall_color || "#F3F4F6"}
                onChange={(e) => updateScene({ wall_color: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-semibold uppercase">Wall Paint Finish</label>
            <select
              value={project.scene.wall_finish || "Matte"}
              onChange={(e) => updateScene({ wall_finish: e.target.value as any })}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
            >
              <option value="Matte">Matte Paint</option>
              <option value="Satin">Satin Paint</option>
              <option value="Gloss">Gloss Paint</option>
            </select>
          </div>

          {/* Global Floor Customization */}
          <div className="border-t border-slate-900 pt-3">
            <label className="text-xs text-slate-500 font-semibold uppercase">Floor Style</label>
            <select
              value={project.scene.floor_material || "light_oak_wood"}
              onChange={(e) => {
                const val = e.target.value;
                updateScene({ floor_material: val, floor_color: undefined });
              }}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
            >
              <option value="light_oak_wood">Light Oak Wood</option>
              <option value="walnut_wood">Dark Walnut Wood</option>
              <option value="concrete_gray">Concrete Gray</option>
              <option value="gray_carpet">Soft Carpet</option>
              <option value="marble_white">White Marble</option>
              <option value="dark_tiles">Dark Slate Tiles</option>
              <option value="custom">Custom Color Floor</option>
            </select>
          </div>

          {project.scene.floor_material === "custom" && (
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Custom Floor Color</label>
              <div className="flex flex-row items-center gap-2 mt-1">
                <input
                  type="color"
                  value={project.scene.floor_color || "#D1D5DB"}
                  onChange={(e) => updateScene({ floor_color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={project.scene.floor_color || ""}
                  onChange={(e) => updateScene({ floor_color: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white uppercase font-mono"
                  placeholder="#D1D5DB"
                />
              </div>
            </div>
          )}

          {/* Project settings and defaults */}
          <div className="border-t border-slate-900 pt-3 space-y-3">
            <label className="text-xs text-slate-500 font-semibold uppercase">Grid & Editor Options</label>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Snap to Grid</span>
              <input
                type="checkbox"
                checked={project.settings.gridSnap}
                onChange={(e) => updateSettings({ gridSnap: e.target.checked })}
                className="w-4 h-4 rounded text-sky-500 accent-sky-500 focus:ring-0 cursor-pointer"
              />
            </div>

            {project.settings.gridSnap && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Grid Size (m)</span>
                <input
                  type="number"
                  step="0.05"
                  value={project.settings.gridSize}
                  onChange={(e) => updateSettings({ gridSize: parseFloat(e.target.value) || 0.1 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white mt-1 focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Default Wall Thickness</span>
                <input
                  type="number"
                  step="0.01"
                  value={project.settings.wallThickness}
                  onChange={(e) => updateSettings({ wallThickness: parseFloat(e.target.value) || 0.2 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white mt-1 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Default Wall Height</span>
                <input
                  type="number"
                  step="0.1"
                  value={project.settings.wallHeight}
                  onChange={(e) => updateSettings({ wallHeight: parseFloat(e.target.value) || 2.8 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white mt-1 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 border-l border-slate-800 flex flex-col text-slate-200">
      <div className="p-4 border-b border-slate-800 flex flex-row justify-between items-center bg-slate-900/50">
        <h3 className="font-bold text-sm tracking-wider uppercase text-sky-400">Inspector</h3>
        {selectedItem && (
          <button 
            onClick={() => duplicateItem(selectedItem.id)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
          >
            Duplicate
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-none">
        {/* FURNITURE INSPECTOR */}
        {selectedItem && (
          <>
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Name</label>
              <input
                type="text"
                value={selectedItem.name}
                onChange={(e) => updateItem(selectedItem.id, { name: e.target.value })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase">Position X</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedItem.x}
                  onChange={(e) => updateItem(selectedItem.id, { x: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase">Position Z</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedItem.z}
                  onChange={(e) => updateItem(selectedItem.id, { z: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase">Elevation (Y)</label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedItem.y}
                  onChange={(e) => updateItem(selectedItem.id, { y: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase">Rotation (°)</label>
                <input
                  type="number"
                  step="5"
                  value={selectedItem.rotation}
                  onChange={(e) => updateItem(selectedItem.id, { rotation: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3">
              <label className="text-xs text-slate-500 font-semibold uppercase">Dimensions (m)</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div>
                  <span className="text-[10px] text-slate-600 block">Width</span>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedItem.width}
                    onChange={(e) => updateItem(selectedItem.id, { width: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Height</span>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedItem.height}
                    onChange={(e) => updateItem(selectedItem.id, { height: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 block">Depth</span>
                  <input
                    type="number"
                    step="0.05"
                    value={selectedItem.depth}
                    onChange={(e) => updateItem(selectedItem.id, { depth: Math.max(0.1, parseFloat(e.target.value) || 0.1) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Material Finish</label>
              <select
                value={selectedItem.material || "fabric"}
                onChange={(e) => updateItem(selectedItem.id, { material: e.target.value })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
              >
                <option value="fabric">Fabric</option>
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
                <option value="glass">Glass</option>
                <option value="plastic">Plastic</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Accent Color</label>
              <div className="flex flex-row items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedItem.color || "#A1A1AA"}
                  onChange={(e) => updateItem(selectedItem.id, { color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedItem.color || "#A1A1AA"}
                  onChange={(e) => updateItem(selectedItem.id, { color: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4">
              <button
                onClick={() => deleteItem(selectedItem.id)}
                className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-900 text-red-200 text-xs font-semibold rounded transition"
              >
                Delete Object
              </button>
            </div>
          </>
        )}

        {/* WALL INSPECTOR */}
        {selectedWall && (
          <>
            <div className="p-3 bg-slate-900/30 rounded border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-slate-300">Wall Settings</p>
              <p className="mt-1">ID: {selectedWall.id}</p>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Length (m)</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat(wallLength.toFixed(2)) || 0}
                onChange={(e) => handleLengthChange(parseFloat(e.target.value) || 0.1)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Thickness (m)</label>
              <input
                type="number"
                step="0.05"
                value={selectedWall.thickness}
                onChange={(e) => updateWall(selectedWall.id, { thickness: Math.max(0.05, parseFloat(e.target.value) || 0.1) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={selectedWall.height}
                onChange={(e) => updateWall(selectedWall.id, { height: Math.max(0.5, parseFloat(e.target.value) || 2.4) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Individual Accent Color</label>
              <div className="flex flex-row items-center gap-2 mt-1">
                <input
                  type="color"
                  value={selectedWall.color || project.scene.wall_color || "#F3F4F6"}
                  onChange={(e) => updateWall(selectedWall.id, { color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedWall.color || ""}
                  placeholder="Inherit Global Paint"
                  onChange={(e) => updateWall(selectedWall.id, { color: e.target.value || undefined })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                />
                {selectedWall.color && (
                  <button
                    onClick={() => updateWall(selectedWall.id, { color: undefined })}
                    className="text-xs text-amber-500 hover:text-amber-400"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4">
              <button
                onClick={() => deleteWall(selectedWall.id)}
                className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-900 text-red-200 text-xs font-semibold rounded transition"
              >
                Delete Wall
              </button>
            </div>
          </>
        )}

        {/* OPENING INSPECTOR (DOORS/WINDOWS) */}
        {selectedOpening && (
          <>
            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Type</label>
              <span className="block capitalize font-bold text-sky-400 mt-0.5">{selectedOpening.type}</span>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Width (m)</label>
              <input
                type="number"
                step="0.05"
                value={selectedOpening.width}
                onChange={(e) => updateOpening(selectedOpening.id, { width: Math.max(0.3, parseFloat(e.target.value) || 0.3) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Height (m)</label>
              <input
                type="number"
                step="0.05"
                value={selectedOpening.height}
                onChange={(e) => updateOpening(selectedOpening.id, { height: Math.max(0.3, parseFloat(e.target.value) || 0.3) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Distance from Start (m)</label>
              <input
                type="number"
                step="0.05"
                value={selectedOpening.distance}
                onChange={(e) => updateOpening(selectedOpening.id, { distance: Math.max(0, parseFloat(e.target.value) || 0) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white"
              />
            </div>

            <div className="border-t border-slate-900 pt-4">
              <button
                onClick={() => deleteOpening(selectedOpening.id)}
                className="w-full py-2 bg-red-950 hover:bg-red-900 border border-red-900 text-red-200 text-xs font-semibold rounded transition"
              >
                Delete Opening
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
