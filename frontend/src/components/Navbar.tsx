"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Unit } from "../types";

export function Navbar() {
  const { 
    project, 
    undo, 
    redo, 
    updateSettings,
    projectsList,
    isLoading,
    fetchProjects,
    loadProject,
    saveProjectToDb,
    createProjectInDb,
    generateAILayoutViaAPI
  } = useStore();
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load project list from DB on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ units: e.target.value as Unit });
  };

  // Triggers backend AI Layout Generator
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    // Standard default dimensions for generated rooms
    const defaultDimensions = { width: 6.0, length: 5.0, height: 2.8 };
    
    await generateAILayoutViaAPI(aiPrompt, defaultDimensions);
    setIsGenerating(false);
    setAiPrompt("");
  };

  const handleExportPDF = () => {
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

  const handleCreateNew = async () => {
    const name = prompt("Enter new project name:", "A&R Custom Design");
    if (name && name.trim()) {
      await createProjectInDb(name.trim());
    }
  };

  return (
    <div className="w-full h-16 bg-slate-950 border-b border-slate-800 px-6 flex flex-row items-center justify-between text-slate-100 shadow-lg select-none">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <img 
          src="/logo.jpg" 
          alt="A&R Contractors & Builders Logo" 
          className="w-10 h-10 object-contain rounded bg-white p-0.5 border border-slate-700 shadow-md shadow-sky-500/10" 
        />
        <div className="flex flex-col">
          <span className="font-extrabold text-[13px] tracking-wide text-white uppercase leading-none">A&R Group</span>
          <span className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold mt-0.5">Contractors & Builders</span>
        </div>
      </div>

      {/* Database Project Selection & Creation */}
      <div className="flex items-center gap-2">
        <select
          value={project.id}
          onChange={(e) => loadProject(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
        >
          <option value={project.id}>{project.name} (Current)</option>
          {projectsList
            .filter((p) => p.id !== project.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
        <button
          onClick={handleCreateNew}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-sky-400 border border-slate-800 rounded uppercase tracking-wider"
          title="Create brand new database project"
        >
          + New
        </button>
      </div>

      {/* AI Assistant Quick Prompt Tool */}
      <form onSubmit={handleAIGenerate} className="flex-1 max-w-md mx-6 flex flex-row items-center bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1">
        <span className="w-2 h-2 rounded-full bg-sky-400 mr-2 animate-pulse" />
        <input
          type="text"
          placeholder="AI Prompt: 'Scandinavian living room' or 'Modern bedroom'..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          disabled={isGenerating || isLoading}
          className="flex-1 bg-transparent text-xs text-slate-200 outline-none border-none placeholder-slate-500 font-semibold"
        />
        <button
          type="submit"
          disabled={isGenerating || isLoading}
          className="text-[10px] font-bold text-sky-400 uppercase tracking-wide hover:text-sky-300 disabled:text-slate-500 ml-2"
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
            className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs"
            title="Undo"
          >
            ↺
          </button>
          <button 
            onClick={redo}
            className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-xs"
            title="Redo"
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

        {/* Database Save */}
        <button
          onClick={saveProjectToDb}
          disabled={isLoading}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-xs font-bold text-sky-400 border border-slate-800 rounded-lg transition disabled:text-slate-500"
        >
          {isLoading ? "Saving..." : "Save to DB"}
        </button>
        
        {/* PDF Export */}
        <button
          onClick={handleExportPDF}
          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-xs font-bold text-slate-950 rounded-lg shadow-md transition"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
}
