import { create } from "zustand";
import { 
  ProjectState, FurnitureItem, Wall, RoomOpening, 
  LightFixture, ProjectSettings, Point2D 
} from "../types";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface HistoryEntry {
  scene: ProjectState["scene"];
  settings: ProjectState["settings"];
}

interface RoomCraftStore {
  project: ProjectState;
  selectedItemId: string | null;
  selectedWallId: string | null;
  selectedOpeningId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  
  // API State
  isLoading: boolean;
  apiError: string | null;
  projectsList: { id: string; name: string; description?: string }[];
  
  // API Actions
  fetchProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveProjectToDb: () => Promise<void>;
  createProjectInDb: (name: string, description?: string) => Promise<void>;
  deleteProjectFromDb: (id: string) => Promise<void>;
  generateAILayoutViaAPI: (prompt: string, dimensions: { width: number; length: number; height: number }) => Promise<void>;

  // Project Actions
  setProject: (proj: ProjectState) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  updateScene: (updates: Partial<ProjectScene>) => void;
  
  // Selection
  selectItem: (id: string | null) => void;
  selectWall: (id: string | null) => void;
  selectOpening: (id: string | null) => void;
  
  // Furniture Items
  addItem: (item: Omit<FurnitureItem, "id">) => void;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  
  // Wall Drawing & Editing
  addWall: (wall: Omit<Wall, "id">) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  deleteWall: (id: string) => void;
  
  // Openings (Doors/Windows)
  addOpening: (opening: Omit<RoomOpening, "id">) => void;
  updateOpening: (id: string, updates: Partial<RoomOpening>) => void;
  deleteOpening: (id: string) => void;
  
  // Lighting
  updateLight: (id: string, updates: Partial<LightFixture>) => void;
  
  // History Control
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const initialScene = {
  wall_color: "#F2EFE9",
  wall_finish: "Matte" as const,
  floor_material: "light_oak_wood",
  walls: [
    { id: "wall-1", start: { x: -3.0, y: -2.5 }, end: { x: 3.0, y: -2.5 }, thickness: 0.2, height: 2.8 },
    { id: "wall-2", start: { x: 3.0, y: -2.5 }, end: { x: 3.0, y: 2.5 }, thickness: 0.2, height: 2.8 },
    { id: "wall-3", start: { x: 3.0, y: 2.5 }, end: { x: -3.0, y: 2.5 }, thickness: 0.2, height: 2.8 },
    { id: "wall-4", start: { x: -3.0, y: 2.5 }, end: { x: -3.0, y: -2.5 }, thickness: 0.2, height: 2.8 }
  ] as Wall[],
  items: [
    {
      id: "item-bed",
      catalogId: "king_size_bed",
      name: "King Size Bed",
      category: "bedroom",
      x: -1.2,
      y: 0.0,
      z: -0.8,
      rotation: 0,
      width: 1.9,
      height: 1.1,
      depth: 2.1,
      color: "#E5E7EB",
      material: "fabric",
      price: 899,
      locked: false,
      visible: true
    },
    {
      id: "item-nightstand",
      catalogId: "oak_nightstand",
      name: "Oak Nightstand",
      category: "bedroom",
      x: -2.4,
      y: 0.0,
      z: -2.0,
      rotation: 0,
      width: 0.5,
      height: 0.5,
      depth: 0.4,
      color: "#D1A377",
      material: "wood",
      price: 120,
      locked: false,
      visible: true
    },
    {
      id: "item-sofa",
      catalogId: "3-seater_comfort_sofa",
      name: "3-Seater Comfort Sofa",
      category: "living_room",
      x: 1.8,
      y: 0.0,
      z: 1.2,
      rotation: 180,
      width: 2.2,
      height: 0.85,
      depth: 0.95,
      color: "#4B5563",
      material: "fabric",
      price: 750,
      locked: false,
      visible: true
    },
    {
      id: "item-table",
      catalogId: "minimalist_coffee_table",
      name: "Minimalist Coffee Table",
      category: "living_room",
      x: 1.8,
      y: 0.0,
      z: 0.0,
      rotation: 0,
      width: 1.1,
      height: 0.4,
      depth: 0.6,
      color: "#D1A377",
      material: "wood",
      price: 150,
      locked: false,
      visible: true
    }
  ] as FurnitureItem[],
  openings: [
    { id: "door-1", type: "door", wallId: "wall-3", distance: 1.5, width: 0.9, height: 2.1, style: "single" },
    { id: "window-1", type: "window", wallId: "wall-1", distance: 3.0, width: 1.2, height: 1.4, style: "sliding" }
  ] as RoomOpening[],
  lights: [
    { id: "ambient", type: "ambient", color: "#FFFFFF", intensity: 0.7, position: { x: 0, y: 3, z: 0 }, castShadows: false },
    { id: "sunlight", type: "directional", color: "#FFFBEB", intensity: 1.0, position: { x: 5, y: 10, z: 5 }, castShadows: true }
  ] as LightFixture[]
};

const initialSettings = {
  units: "meters" as const,
  gridSnap: true,
  gridSize: 0.5,
  wallThickness: 0.2,
  wallHeight: 2.8
};

export const useStore = create<RoomCraftStore>((set, get) => ({
  project: {
    id: "3c7b37d4-8d48-43e9-a3b0-0cb29ffeb8f2", // Default loaded match
    name: "A&R Space Design Project",
    settings: initialSettings,
    scene: initialScene
  },
  selectedItemId: null,
  selectedWallId: null,
  selectedOpeningId: null,
  history: [{ scene: { ...initialScene }, settings: { ...initialSettings } }],
  historyIndex: 0,
  
  isLoading: false,
  apiError: null,
  projectsList: [],

  // API implementations
  fetchProjects: async () => {
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      set({ 
        projectsList: data.map((p: any) => ({ id: p.id, name: p.name, description: p.description })),
        isLoading: false 
      });
    } catch (err: any) {
      set({ apiError: err.message || "Failed fetching projects", isLoading: false });
    }
  },

  loadProject: async (id: string) => {
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project details");
      const data = await res.json();
      const mappedProject: ProjectState = {
        id: data.id,
        name: data.name,
        description: data.description,
        settings: data.settings,
        scene: data.scene_data
      };
      set({ 
        project: mappedProject, 
        selectedItemId: null, 
        selectedWallId: null, 
        selectedOpeningId: null,
        history: [{ scene: { ...mappedProject.scene }, settings: { ...mappedProject.settings } }],
        historyIndex: 0,
        isLoading: false 
      });
    } catch (err: any) {
      set({ apiError: err.message || "Failed loading project", isLoading: false });
    }
  },

  saveProjectToDb: async () => {
    const { project } = get();
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          description: project.description || "",
          settings: project.settings,
          scene_data: project.scene,
          thumbnail_url: null
        })
      });
      if (!res.ok) throw new Error("Failed to save project");
      const data = await res.json();
      set({ isLoading: false });
    } catch (err: any) {
      set({ apiError: err.message || "Failed to save project", isLoading: false });
      alert("Error saving project to database: " + err.message);
    }
  },

  createProjectInDb: async (name: string, description?: string) => {
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || "",
          settings: initialSettings,
          scene_data: initialScene,
          thumbnail_url: null
        })
      });
      if (!res.ok) throw new Error("Failed to create project");
      const data = await res.json();
      const mappedProject: ProjectState = {
        id: data.id,
        name: data.name,
        description: data.description,
        settings: data.settings,
        scene: data.scene_data
      };
      set((state) => ({
        project: mappedProject,
        projectsList: [...state.projectsList, { id: data.id, name: data.name, description: data.description }],
        selectedItemId: null,
        selectedWallId: null,
        selectedOpeningId: null,
        history: [{ scene: { ...mappedProject.scene }, settings: { ...mappedProject.settings } }],
        historyIndex: 0,
        isLoading: false
      }));
    } catch (err: any) {
      set({ apiError: err.message || "Failed creating project", isLoading: false });
      alert("Error creating project in database: " + err.message);
    }
  },

  deleteProjectFromDb: async (id: string) => {
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete project");
      
      set((state) => {
        const nextList = state.projectsList.filter((p) => p.id !== id);
        return {
          projectsList: nextList,
          isLoading: false
        };
      });

      // If the currently loaded project was deleted, load another or reset
      const { project } = get();
      if (project.id === id) {
        const nextProj = get().projectsList[0];
        if (nextProj) {
          await get().loadProject(nextProj.id);
        } else {
          // Reset to default
          set({
            project: {
              id: "3c7b37d4-8d48-43e9-a3b0-0cb29ffeb8f2",
              name: "A&R Space Design Project",
              settings: initialSettings,
              scene: initialScene
            }
          });
        }
      }
    } catch (err: any) {
      set({ apiError: err.message || "Failed to delete project", isLoading: false });
    }
  },

  generateAILayoutViaAPI: async (prompt: string, dimensions: { width: number; length: number; height: number }) => {
    set({ isLoading: true, apiError: null });
    try {
      const res = await fetch(`${API_URL}/api/ai/generate-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          room_dimensions: dimensions,
          units: get().project.settings.units
        })
      });
      if (!res.ok) throw new Error("Failed to arrange room via AI");
      const data = await res.json();
      
      if (data.status === "success" && data.scene) {
        // Adapt fields from response to types
        const backendScene = data.scene;
        const adaptedItems = backendScene.items.map((item: any) => ({
          id: item.id,
          catalogId: item.catalog_id || item.id,
          name: item.name,
          category: item.category,
          x: item.x,
          y: item.y,
          z: item.z,
          rotation: item.rotation,
          width: item.width,
          height: item.height,
          depth: item.depth,
          color: item.color,
          material: item.material,
          price: item.price
        }));

        const adaptedWalls = backendScene.walls.map((wall: any) => ({
          id: wall.id,
          start: wall.start,
          end: wall.end,
          thickness: wall.thickness || get().project.settings.wallThickness,
          height: wall.height || get().project.settings.wallHeight
        }));

        const adaptedOpenings = backendScene.openings.map((op: any) => ({
          id: op.id,
          type: op.type,
          wallId: op.wall_id,
          distance: op.distance,
          width: op.width,
          height: op.height,
          style: op.style
        }));

        const adaptedScene = {
          wall_color: backendScene.wall_color,
          wall_finish: backendScene.wall_finish || "Matte",
          floor_material: backendScene.floor_material,
          walls: adaptedWalls,
          items: adaptedItems,
          openings: adaptedOpenings,
          lights: backendScene.lights || get().project.scene.lights
        };

        const updatedProject = {
          ...get().project,
          scene: adaptedScene
        };

        set({
          project: updatedProject,
          selectedItemId: null,
          selectedWallId: null,
          selectedOpeningId: null
        });
        
        get().pushHistory();
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ apiError: err.message || "AI arrangement failed", isLoading: false });
      alert("Error generating AI layout: " + err.message);
    }
  },

  // Base state modifications
  setProject: (proj) => set({ project: proj, selectedItemId: null }),

  updateSettings: (settingsUpdates) => {
    set((state) => {
      const updatedSettings = { ...state.project.settings, ...settingsUpdates };
      const updatedProject = { ...state.project, settings: updatedSettings };
      
      // Update historical snapshot
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: { ...state.project.scene }, settings: updatedSettings });
      
      return {
        project: updatedProject,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateScene: (sceneUpdates) => {
    set((state) => {
      const updatedScene = { ...state.project.scene, ...sceneUpdates };
      const updatedProject = { ...state.project, scene: updatedScene };
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });
      
      return {
        project: updatedProject,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  selectItem: (id) => set({ selectedItemId: id, selectedWallId: null, selectedOpeningId: null }),
  selectWall: (id) => set({ selectedWallId: id, selectedItemId: null, selectedOpeningId: null }),
  selectOpening: (id) => set({ selectedOpeningId: id, selectedItemId: null, selectedWallId: null }),

  addItem: (item) => {
    const id = `item-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: FurnitureItem = {
      ...item,
      id,
      locked: false,
      visible: true
    };
    
    set((state) => {
      const updatedItems = [...state.project.scene.items, newItem];
      const updatedScene = { ...state.project.scene, items: updatedItems };
      const updatedProject = { ...state.project, scene: updatedScene };
      
      // Update history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });
      
      return {
        project: updatedProject,
        selectedItemId: id,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateItem: (id, updates) => {
    set((state) => {
      const updatedItems = state.project.scene.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      const updatedScene = { ...state.project.scene, items: updatedItems };
      const updatedProject = { ...state.project, scene: updatedScene };
      return { project: updatedProject };
    });
  },

  deleteItem: (id) => {
    set((state) => {
      const updatedItems = state.project.scene.items.filter((item) => item.id !== id);
      const updatedScene = { ...state.project.scene, items: updatedItems };
      const updatedProject = { ...state.project, scene: updatedScene };
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });

      return {
        project: updatedProject,
        selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  duplicateItem: (id) => {
    const itemToClone = get().project.scene.items.find((item) => item.id === id);
    if (!itemToClone) return;
    
    get().addItem({
      ...itemToClone,
      id: undefined as any,
      x: itemToClone.x + 0.5,
      z: itemToClone.z + 0.5
    } as any);
  },

  addWall: (wall) => {
    const id = `wall-${Math.random().toString(36).substr(2, 9)}`;
    const newWall: Wall = { ...wall, id };

    set((state) => {
      const updatedWalls = [...state.project.scene.walls, newWall];
      const updatedScene = { ...state.project.scene, walls: updatedWalls };
      const updatedProject = { ...state.project, scene: updatedScene };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });

      return {
        project: updatedProject,
        selectedWallId: id,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateWall: (id, updates) => {
    set((state) => {
      const updatedWalls = state.project.scene.walls.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      );
      const updatedScene = { ...state.project.scene, walls: updatedWalls };
      const updatedProject = { ...state.project, scene: updatedScene };
      return { project: updatedProject };
    });
  },

  deleteWall: (id) => {
    set((state) => {
      const updatedWalls = state.project.scene.walls.filter((w) => w.id !== id);
      const updatedOpenings = state.project.scene.openings.filter((o) => o.wallId !== id);
      const updatedScene = { ...state.project.scene, walls: updatedWalls, openings: updatedOpenings };
      const updatedProject = { ...state.project, scene: updatedScene };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });

      return {
        project: updatedProject,
        selectedWallId: state.selectedWallId === id ? null : state.selectedWallId,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  addOpening: (opening) => {
    const id = `opening-${Math.random().toString(36).substr(2, 9)}`;
    const newOpening: RoomOpening = { ...opening, id };

    set((state) => {
      const updatedOpenings = [...state.project.scene.openings, newOpening];
      const updatedScene = { ...state.project.scene, openings: updatedOpenings };
      const updatedProject = { ...state.project, scene: updatedScene };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });

      return {
        project: updatedProject,
        selectedOpeningId: id,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateOpening: (id, updates) => {
    set((state) => {
      const updatedOpenings = state.project.scene.openings.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      );
      const updatedScene = { ...state.project.scene, openings: updatedOpenings };
      const updatedProject = { ...state.project, scene: updatedScene };
      return { project: updatedProject };
    });
  },

  deleteOpening: (id) => {
    set((state) => {
      const updatedOpenings = state.project.scene.openings.filter((o) => o.id !== id);
      const updatedScene = { ...state.project.scene, openings: updatedOpenings };
      const updatedProject = { ...state.project, scene: updatedScene };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ scene: updatedScene, settings: state.project.settings });

      return {
        project: updatedProject,
        selectedOpeningId: state.selectedOpeningId === id ? null : state.selectedOpeningId,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  updateLight: (id, updates) => {
    set((state) => {
      const updatedLights = state.project.scene.lights.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      );
      const updatedScene = { ...state.project.scene, lights: updatedLights };
      const updatedProject = { ...state.project, scene: updatedScene };
      return { project: updatedProject };
    });
  },

  pushHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        scene: JSON.parse(JSON.stringify(state.project.scene)),
        settings: { ...state.project.settings }
      });
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const target = history[newIndex];
      set((state) => ({
        project: {
          ...state.project,
          scene: target.scene,
          settings: target.settings
        },
        historyIndex: newIndex,
        selectedItemId: null,
        selectedWallId: null,
        selectedOpeningId: null
      }));
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const target = history[newIndex];
      set((state) => ({
        project: {
          ...state.project,
          scene: target.scene,
          settings: target.settings
        },
        historyIndex: newIndex,
        selectedItemId: null,
        selectedWallId: null,
        selectedOpeningId: null
      }));
    }
  }
}));
