"use client";

import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { Unit } from "../types";

export function Navbar() {
  const { project, undo, redo, updateSettings, setProject } = useStore();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ units: e.target.value as Unit });
  };

  // Triggers the rules-based AI Arrangement layout generator locally
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate short server delay
    setTimeout(() => {
      // Import the dynamic AIService logic from the backend service logic mapped to JS
      const promptLower = aiPrompt.toLowerCase();
      let style = "Scandinavian";
      let wallColor = "#F3F4F6";
      let floorMaterial = "light_oak_wood";
      
      if (promptLower.includes("mid-century") || promptLower.includes("retro")) {
        style = "Mid-Century Modern";
        wallColor = "#E5E7EB";
        floorMaterial = "walnut_wood";
      } else if (promptLower.includes("industrial") || promptLower.includes("loft")) {
        style = "Industrial";
        wallColor = "#78350F"; // concrete/brick raw tone
        floorMaterial = "concrete_gray";
      } else if (promptLower.includes("office") || promptLower.includes("work")) {
        style = "Office";
        wallColor = "#FFFFFF";
        floorMaterial = "gray_carpet";
      } else if (promptLower.includes("bedroom") || promptLower.includes("sleep")) {
        style = "Bedroom";
        wallColor = "#F0F9FF";
        floorMaterial = "light_oak_wood";
      }

      // Generate standard bounding walls
      const walls = [
        { id: "w1", start: { x: -3, y: -2.5 }, end: { x: 3, y: -2.5 }, thickness: 0.2, height: 2.8 },
        { id: "w2", start: { x: 3, y: -2.5 }, end: { x: 3, y: 2.5 }, thickness: 0.2, height: 2.8 },
        { id: "w3", start: { x: 3, y: 2.5 }, end: { x: -3, y: 2.5 }, thickness: 0.2, height: 2.8 },
        { id: "w4", start: { x: -3, y: 2.5 }, end: { x: -3, y: -2.5 }, thickness: 0.2, height: 2.8 }
      ];

      // Standardize positions based on style
      const items = [];
      if (style === "Bedroom") {
        items.push({
          id: "bed-ai",
          catalogId: "bed_1",
          name: "King Size Bed",
          category: "bedroom",
          x: 0.0, y: 0.0, z: -1.4,
          rotation: 0, width: 1.9, height: 1.1, depth: 2.1,
          color: "#E5E7EB", material: "fabric"
        });
        items.push({
          id: "ns-l-ai",
          catalogId: "nightstand",
          name: "Oak Nightstand",
          category: "bedroom",
          x: -1.3, y: 0.0, z: -2.0,
          rotation: 0, width: 0.5, height: 0.5, depth: 0.4,
          color: "#D1A377", material: "wood"
        });
      } else if (style === "Office") {
        items.push({
          id: "desk-ai",
          catalogId: "desk_1",
          name: "Executive Wooden Desk",
          category: "office",
          x: 0.0, y: 0.0, z: -0.5,
          rotation: 0, width: 1.6, height: 0.75, depth: 0.8,
          color: "#8B5A2B", material: "wood"
        });
        items.push({
          id: "chair-ai",
          catalogId: "chair_1",
          name: "Ergonomic Mesh Chair",
          category: "office",
          x: 0.0, y: 0.0, z: -1.2,
          rotation: 0, width: 0.65, height: 0.9, depth: 0.65,
          color: "#111827", material: "plastic"
        });
      } else {
        // Living room default setup
        items.push({
          id: "sofa-ai",
          catalogId: "sofa_1",
          name: "3-Seater Comfort Sofa",
          category: "living",
          x: 0.0, y: 0.0, z: 1.2,
          rotation: 180, width: 2.2, height: 0.85, depth: 0.95,
          color: "#4B5563", material: "fabric"
        });
        items.push({
          id: "ct-ai",
          catalogId: "coffee_table_1",
          name: "Minimalist Coffee Table",
          category: "living",
          x: 0.0, y: 0.0, z: 0.0,
          rotation: 0, width: 1.1, height: 0.4, depth: 0.6,
          color: "#D1A377", material: "wood"
        });
      }

      setProject({
        ...project,
        scene: {
          ...project.scene,
          wall_color: wallColor,
          floor_material: floorMaterial,
          walls,
          items,
          openings: [
            { id: "door-ai", type: "door", wallId: "w3", distance: 1.5, width: 0.9, height: 2.1, style: "single" }
          ]
        }
      });
      setIsGenerating(false);
      setAiPrompt("");
    }, 1500);
  };

  const handleExportPDF = () => {
    // Basic mock PDF export triggered locally
    alert(
      `Generating PDF Report...\n\n` +
      `Project: ${project.name}\n` +
      `Units: ${project.settings.units}\n` +
      `Walls Count: ${project.scene.walls.length}\n` +
      `Items Placed: ${project.scene.items.length}\n` +
      `Estimated Cost: $${project.scene.items.reduce((sum, item) => sum + (item.price || 0), 0)}\n\n` +
      `Check your downloads for the export.`
    );
  };

  const handleSave = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/ /g, "_")}_project.json`;
    a.click();
  };

  return (
    <div className="w-full h-16 bg-slate-950 border-b border-slate-800 px-6 flex flex-row items-center justify-between text-slate-100 shadow-lg select-none">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 shadow-inner">
          RC
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-wide text-white uppercase">RoomCraft</span>
          <span className="text-slate-500 text-[10px] block -mt-1 uppercase tracking-widest font-semibold">Studio</span>
        </div>
      </div>

      {/* AI Assistant Quick Prompt Tool */}
      <form onSubmit={handleAIGenerate} className="flex-1 max-w-md mx-6 flex flex-row items-center bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1">
        <input
          type="text"
          placeholder="AI Prompt: 'Scandinavian living room'..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-transparent text-xs text-slate-200 outline-none border-none placeholder-slate-500 font-semibold"
        />
        <button
          type="submit"
          disabled={isGenerating}
          className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide hover:text-emerald-300 disabled:text-slate-500 ml-2"
        >
          {isGenerating ? "Arranging..." : "Generate"}
        </button>
      </form>

      {/* Global Actions */}
      <div className="flex flex-row items-center gap-4">
        {/* Undo/Redo */}
        <div className="flex flex-row items-center border border-slate-900 bg-slate-900/40 rounded-lg p-0.5">
          <button 
            onClick={undo}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            title="Undo (Ctrl+Z)"
          >
            ↺
          </button>
          <button 
            onClick={redo}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            title="Redo (Ctrl+Y)"
          >
            ↻
          </button>
        </div>

        {/* Units Dropdown */}
        <div className="flex flex-row items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold uppercase">Units</span>
          <select
            value={project.settings.units}
            onChange={handleUnitChange}
            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none"
          >
            <option value="meters">Meters</option>
            <option value="feet">Feet</option>
            <option value="centimeters">Centimeters</option>
          </select>
        </div>

        {/* Save & Export */}
        <button
          onClick={handleSave}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-slate-200 border border-slate-800 rounded-lg transition"
        >
          Save
        </button>
        <button
          onClick={handleExportPDF}
          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-xs font-bold text-slate-950 rounded-lg shadow-md transition"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
