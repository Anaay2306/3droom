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
    duplicateItem
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

  if (!selectedItem && !selectedWall && !selectedOpening) {
    return (
      <div className="w-full h-full bg-slate-950 border-l border-slate-800 p-4 text-slate-400 text-sm flex flex-col justify-center items-center text-center">
        <p>No element selected</p>
        <p className="text-xs text-slate-600 mt-1">Select an item on the canvas to configure properties</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-950 border-l border-slate-800 flex flex-col text-slate-200">
      <div className="p-4 border-b border-slate-800 flex flex-row justify-between items-center bg-slate-900/50">
        <h3 className="font-bold text-sm tracking-wider uppercase text-emerald-400">Inspector</h3>
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
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Thickness (m)</label>
              <input
                type="number"
                step="0.05"
                value={selectedWall.thickness}
                onChange={(e) => updateWall(selectedWall.id, { thickness: Math.max(0.05, parseFloat(e.target.value) || 0.1) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase">Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={selectedWall.height}
                onChange={(e) => updateWall(selectedWall.id, { height: Math.max(0.5, parseFloat(e.target.value) || 2.4) })}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
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
              <span className="block capitalize font-bold text-emerald-400 mt-0.5">{selectedOpening.type}</span>
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
