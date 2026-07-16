import { create } from "zustand";
import { 
  ProjectState, FurnitureItem, Wall, RoomOpening, 
  LightFixture, ProjectSettings, Point2D 
} from "../types";

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
  
  // Project Actions
  setProject: (proj: ProjectState) => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  
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
  wall_color: "#F3F4F6",
  wall_finish: "Matte" as const,
  floor_material: "light_oak_wood",
  walls: [] as Wall[],
  items: [] as FurnitureItem[],
  openings: [] as RoomOpening[],
  lights: [
    { id: "ambient", type: "ambient", color: "#FFFFFF", intensity: 0.7, position: { x: 0, y: 3, z: 0 }, castShadows: false },
    { id: "sunlight", type: "directional", color: "#FFFBEB", intensity: 1.0, position: { x: 5, y: 10, z: 5 }, castShadows: True }
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
    id: "project-1",
    name: "New Roomcraft Design",
    settings: initialSettings,
    scene: initialScene
  },
  selectedItemId: null,
  selectedWallId: null,
  selectedOpeningId: null,
  history: [{ scene: { ...initialScene }, settings: { ...initialSettings } }],
  historyIndex: 0,

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
      x: itemToClone.x + 0.5, // shift position slightly
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
      // Remove openings connected to this wall
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
