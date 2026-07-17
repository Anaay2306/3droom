import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { AssetLibrary } from "./components/library/AssetLibrary";
import { Editor2D } from "./components/editor/Editor2D";
import { Viewport3D } from "./components/editor/Viewport3D";
import { PropertiesPanel } from "./components/properties/PropertiesPanel";

function App() {
  const [activePane, setActivePane] = useState<"both" | "2d" | "3d">("both");

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Studio Body */}
      <div className="flex-1 flex flex-row overflow-hidden w-full relative">
        {/* Left Side: Asset Library */}
        <aside className="w-80 shrink-0 h-full border-r border-slate-900 bg-slate-950 flex flex-col z-30">
          <AssetLibrary />
        </aside>

        {/* Central Workspace: 2D Canvas & 3D WebGL WebGL rendering */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900 relative">
          
          {/* Workspace Views Toggle Bar */}
          <div className="h-10 border-b border-slate-800 bg-slate-950/40 px-4 flex flex-row items-center justify-between z-20">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Canvas Workspace</span>
            <div className="flex flex-row bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setActivePane("2d")}
                className={`px-3.5 py-1 rounded transition ${activePane === "2d" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                2D Design
              </button>
              <button
                onClick={() => setActivePane("both")}
                className={`px-3.5 py-1 rounded transition ${activePane === "both" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                Split Screen
              </button>
              <button
                onClick={() => setActivePane("3d")}
                className={`px-3.5 py-1 rounded transition ${activePane === "3d" ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:text-slate-200"}`}
              >
                3D Preview
              </button>
            </div>
          </div>

          {/* Editors Container */}
          <div className="flex-1 flex flex-row overflow-hidden">
            {(activePane === "2d" || activePane === "both") && (
              <div 
                className={`h-full relative overflow-hidden transition-all duration-350 ${
                  activePane === "both" ? "w-1/2 border-r border-slate-800" : "w-full"
                }`}
              >
                <Editor2D />
              </div>
            )}
            {(activePane === "3d" || activePane === "both") && (
              <div 
                className={`h-full relative overflow-hidden transition-all duration-350 ${
                  activePane === "both" ? "w-1/2" : "w-full"
                }`}
              >
                <Viewport3D />
              </div>
            )}
          </div>
        </main>

        {/* Right Side: Properties Panel */}
        <aside className="w-72 shrink-0 h-full border-l border-slate-900 bg-slate-950 flex flex-col z-30">
          <PropertiesPanel />
        </aside>
      </div>
    </div>
  );
}

export default App;
