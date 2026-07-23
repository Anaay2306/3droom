"use client";

import React, { useState } from "react";
import { useStore } from "../../store/useStore";

interface CatalogAsset {
  name: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  defaultColor: string;
  defaultMaterial: string;
  price: number;
}

const FURNITURE_CATALOG: Record<string, CatalogAsset[]> = {
  bedroom: [
    { name: "King Size Bed", category: "bedroom", width: 1.9, height: 1.1, depth: 2.1, defaultColor: "#E5E7EB", defaultMaterial: "fabric", price: 899 },
    { name: "Oak Nightstand", category: "bedroom", width: 0.5, height: 0.5, depth: 0.4, defaultColor: "#D1A377", defaultMaterial: "wood", price: 120 },
    { name: "Chest of Drawers", category: "bedroom", width: 0.8, height: 1.0, depth: 0.5, defaultColor: "#FFFFFF", defaultMaterial: "wood", price: 299 },
    { name: "Slide Wardrobe", category: "bedroom", width: 1.8, height: 2.2, depth: 0.65, defaultColor: "#E5E7EB", defaultMaterial: "wood", price: 599 }
  ],
  living: [
    { name: "3-Seater Comfort Sofa", category: "living_room", width: 2.2, height: 0.85, depth: 0.95, defaultColor: "#4B5563", defaultMaterial: "fabric", price: 750 },
    { name: "Armchair", category: "living_room", width: 0.95, height: 0.8, depth: 0.9, defaultColor: "#F59E0B", defaultMaterial: "fabric", price: 349 },
    { name: "Minimalist Coffee Table", category: "living_room", width: 1.1, height: 0.4, depth: 0.6, defaultColor: "#D1A377", defaultMaterial: "wood", price: 150 },
    { name: "TV Console Table", category: "living_room", width: 1.8, height: 0.5, depth: 0.45, defaultColor: "#1F2937", defaultMaterial: "wood", price: 280 }
  ],
  kitchen: [
    { name: "Kitchen Base Unit", category: "kitchen", width: 0.6, height: 0.85, depth: 0.6, defaultColor: "#F3F4F6", defaultMaterial: "wood", price: 199 },
    { name: "Kitchen Sink Sink Unit", category: "kitchen", width: 1.2, height: 0.85, depth: 0.6, defaultColor: "#F3F4F6", defaultMaterial: "metal", price: 399 },
    { name: "Double Fridge Freezer", category: "kitchen", width: 0.9, height: 1.85, depth: 0.7, defaultColor: "#9CA3AF", defaultMaterial: "metal", price: 999 },
    { name: "Kitchen Counter Stool", category: "kitchen", width: 0.4, height: 0.75, depth: 0.4, defaultColor: "#111827", defaultMaterial: "metal", price: 85 }
  ],
  office: [
    { name: "Executive Wooden Desk", category: "office", width: 1.6, height: 0.75, depth: 0.8, defaultColor: "#8B5A2B", defaultMaterial: "wood", price: 320 },
    { name: "Ergonomic Mesh Chair", category: "office", width: 0.65, height: 0.9, depth: 0.65, defaultColor: "#111827", defaultMaterial: "plastic", price: 249 },
    { name: "Tall Bookshelf Unit", category: "office", width: 1.2, height: 1.8, depth: 0.35, defaultColor: "#4B5563", defaultMaterial: "wood", price: 180 }
  ]
};

export function AssetLibrary() {
  const { addItem, project, setProject, updateScene } = useStore();
  const [activeTab, setActiveTab] = useState<"furniture" | "materials" | "openings">("furniture");
  const [activeCategory, setActiveCategory] = useState<"bedroom" | "living" | "kitchen" | "office">("living");

  const handleAddObject = (asset: CatalogAsset) => {
    // Spawns furniture item at center of design canvas
    addItem({
      catalogId: asset.name.toLowerCase().replace(/ /g, "_"),
      name: asset.name,
      category: asset.category,
      x: 0,
      y: 0,
      z: 0,
      rotation: 0,
      width: asset.width,
      height: asset.height,
      depth: asset.depth,
      color: asset.defaultColor,
      material: asset.defaultMaterial,
      price: asset.price
    });
  };

  const handleAddOpening = (type: "door" | "window") => {
    // Snap-ready door/window opening to start wall
    const targetWall = project.scene.walls[0];
    if (!targetWall) {
      alert("Please draw at least one wall first!");
      return;
    }
    const store = useStore.getState();
    store.addOpening({
      type,
      wallId: targetWall.id,
      distance: 1.0,
      width: type === "door" ? 0.9 : 1.2,
      height: type === "door" ? 2.1 : 1.4,
      style: "single"
    });
  };

  const handleSelectMaterial = (materialKey: string) => {
    updateScene({ floor_material: materialKey, floor_color: undefined });
  };

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-800 flex flex-col text-slate-300">
      {/* Navigation tabs */}
      <div className="flex flex-row border-b border-slate-800 text-xs text-center font-semibold">
        <button
          onClick={() => setActiveTab("furniture")}
          className={`flex-1 py-3 transition ${activeTab === "furniture" ? "bg-slate-900 border-b-2 border-sky-500 text-sky-400" : "hover:bg-slate-900/50"}`}
        >
          Furniture
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`flex-1 py-3 transition ${activeTab === "materials" ? "bg-slate-900 border-b-2 border-sky-500 text-sky-400" : "hover:bg-slate-900/50"}`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveTab("openings")}
          className={`flex-1 py-3 transition ${activeTab === "openings" ? "bg-slate-900 border-b-2 border-sky-500 text-sky-400" : "hover:bg-slate-900/50"}`}
        >
          Openings
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 select-none">
        {activeTab === "furniture" && (
          <div className="space-y-4">
            {/* Category selection */}
            <div className="flex flex-wrap gap-1 border-b border-slate-900 pb-3">
              {(["living", "bedroom", "kitchen", "office"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border transition ${activeCategory === cat ? "bg-sky-950 border-sky-850 text-sky-400" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 gap-2">
              {FURNITURE_CATALOG[activeCategory].map((asset, index) => (
                <div
                  key={index}
                  onClick={() => handleAddObject(asset)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", JSON.stringify(asset));
                  }}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-2 cursor-pointer transition flex flex-col justify-between items-center text-center shadow-md group"
                >
                  {/* Miniature Box Preview Mock */}
                  <div className="w-10 h-10 border border-slate-700 bg-slate-800/40 rounded flex items-center justify-center my-2 text-slate-500 font-mono text-[9px] group-hover:border-sky-500 transition">
                    3D
                  </div>
                  <span className="text-xs font-semibold text-white truncate w-full">{asset.name}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">${asset.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="space-y-4">
            {/* Wall Paint Colors */}
            <div>
              <h4 className="text-xs text-slate-500 font-semibold uppercase mb-2">Wall Paint Colors</h4>
              <div className="flex flex-wrap gap-2 py-1 bg-slate-900/30 p-2 rounded-lg border border-slate-900">
                {[
                  { name: "White", hex: "#FFFFFF" },
                  { name: "Alabaster", hex: "#F2EFE9" },
                  { name: "Cool Gray", hex: "#D1D5DB" },
                  { name: "Slate Blue", hex: "#4B5563" },
                  { name: "Navy Accent", hex: "#1E3A8A" },
                  { name: "Sage", hex: "#8FBC8F" },
                  { name: "Terracotta", hex: "#E2725B" },
                  { name: "Charcoal", hex: "#1F2937" }
                ].map((color) => {
                  const isActive = project.scene.wall_color.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.hex}
                      onClick={() => updateScene({ wall_color: color.hex })}
                      className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${isActive ? "border-sky-500 ring-2 ring-sky-950" : "border-slate-800"}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  );
                })}
              </div>
              {/* Custom Wall Color Picker */}
              <div className="flex flex-row items-center gap-2 mt-2">
                <input
                  type="color"
                  value={project.scene.wall_color || "#F3F4F6"}
                  onChange={(e) => updateScene({ wall_color: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                  title="Custom Wall Color Picker"
                />
                <input
                  type="text"
                  value={project.scene.wall_color || "#F3F4F6"}
                  onChange={(e) => updateScene({ wall_color: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white uppercase"
                  placeholder="Hex color"
                />
              </div>
            </div>

            {/* Wall Paint Finishes */}
            <div>
              <h4 className="text-xs text-slate-500 font-semibold uppercase mb-2">Wall Paint Finishes</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Matte", key: "Matte" },
                  { name: "Satin", key: "Satin" },
                  { name: "Gloss", key: "Gloss" }
                ].map((finish) => {
                  const isActive = project.scene.wall_finish === finish.key;
                  return (
                    <button
                      key={finish.key}
                      onClick={() => updateScene({ wall_finish: finish.key as any })}
                      className={`text-xs font-semibold border rounded-lg py-2 transition ${isActive ? "bg-sky-950/30 border-sky-600 text-sky-400 font-bold" : "bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-850"}`}
                    >
                      {finish.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Floor Finishes */}
            <div>
              <h4 className="text-xs text-slate-500 font-semibold uppercase mb-2">Floor Finishes</h4>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[
                  { name: "Light Oak Wood", key: "light_oak_wood", hex: "#E5C29B" },
                  { name: "Walnut Wood", key: "walnut_wood", hex: "#5C4033" },
                  { name: "Concrete Gray", key: "concrete_gray", hex: "#8A8A8A" },
                  { name: "Soft Carpet", key: "gray_carpet", hex: "#D1D5DB" },
                  { name: "White Marble", key: "marble_white", hex: "#F3F4F6" },
                  { name: "Dark Tiles", key: "dark_tiles", hex: "#2D3748" }
                ].map((mat) => {
                  const isActive = project.scene.floor_material === mat.key && !project.scene.floor_color;
                  return (
                    <div
                      key={mat.key}
                      onClick={() => handleSelectMaterial(mat.key)}
                      className={`border rounded-lg p-2 cursor-pointer transition flex flex-row items-center gap-2 ${isActive ? "bg-sky-950/30 border-sky-600" : "bg-slate-900 border-slate-800 hover:bg-slate-850"}`}
                    >
                      <div className="w-5 h-5 rounded border border-slate-700 shrink-0" style={{ backgroundColor: mat.hex }} />
                      <span className="text-[11px] font-semibold text-white truncate">{mat.name}</span>
                    </div>
                  );
                })}
              </div>
              {/* Custom Floor Color Picker */}
              <div className="flex flex-row items-center gap-2 mt-2">
                <input
                  type="color"
                  value={project.scene.floor_color || "#D1D5DB"}
                  onChange={(e) => updateScene({ floor_color: e.target.value, floor_material: "custom" })}
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
                  title="Custom Floor Color Picker"
                />
                <input
                  type="text"
                  value={project.scene.floor_color || ""}
                  placeholder="Custom Hex Floor"
                  onChange={(e) => updateScene({ floor_color: e.target.value, floor_material: "custom" })}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "openings" && (
          <div className="space-y-3">
            <h4 className="text-xs text-slate-500 font-semibold uppercase">Snappable Openings</h4>
            <div className="grid grid-cols-2 gap-2">
              <div
                onClick={() => handleAddOpening("door")}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-3 cursor-pointer text-center flex flex-col items-center gap-1 group"
              >
                <div className="w-8 h-8 border border-blue-500 bg-blue-950/20 rounded flex items-center justify-center font-bold text-blue-400 text-xs">
                  D
                </div>
                <span className="text-xs font-semibold text-white">Add Door</span>
              </div>
              <div
                onClick={() => handleAddOpening("window")}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-3 cursor-pointer text-center flex flex-col items-center gap-1 group"
              >
                <div className="w-8 h-8 border border-cyan-500 bg-cyan-950/20 rounded flex items-center justify-center font-bold text-cyan-400 text-xs">
                  W
                </div>
                <span className="text-xs font-semibold text-white">Add Window</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
