export type Unit = "feet" | "meters" | "centimeters";

export interface Point2D {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // in units
  height: number;    // in units
  material?: string;
  color?: string;
}

export interface RoomOpening {
  id: string;
  type: "door" | "window";
  wallId: string;
  distance: number; // distance from start of wall
  width: number;
  height: number;
  style: string;   // single, sliding, double, french, arched
}

export interface FurnitureItem {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  x: number;      // x coord in units (relative to center)
  y: number;      // height above floor (elevation)
  z: number;      // z coord in units (relative to center)
  rotation: number; // rotation in degrees around Y axis
  width: number;
  height: number;
  depth: number;
  color?: string;
  material?: string; // wood, metal, fabric, glass, plastic
  textureUrl?: string;
  locked?: boolean;
  visible?: boolean;
  price?: number;
  brand?: string;
  notes?: string;
}

export interface LightFixture {
  id: string;
  type: "ambient" | "directional" | "point" | "spot";
  color: string;
  intensity: number;
  position: { x: number; y: number; z: number };
  castShadows: boolean;
  temperature?: number; // Kelvins (e.g. 3000K, 6500K)
}

export interface ProjectSettings {
  units: Unit;
  gridSnap: boolean;
  gridSize: number; // in units
  wallThickness: number;
  wallHeight: number;
}

export interface ProjectScene {
  wall_color: string;
  wall_finish: "Matte" | "Gloss" | "Satin";
  floor_material: string;
  floor_color?: string;
  walls: Wall[];
  items: FurnitureItem[];
  openings: RoomOpening[];
  lights: LightFixture[];
}

export interface ProjectState {
  id: string;
  name: string;
  description?: string;
  settings: ProjectSettings;
  scene: ProjectScene;
}
