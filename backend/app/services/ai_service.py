import random
from typing import Dict, Any, List

class AIService:
    @staticmethod
    def generate_layout(prompt: str, dimensions: Dict[str, float], units: str = "meters") -> Dict[str, Any]:
        """
        Parses the prompt and automatically returns a complete spatial arrangement of items,
        walls, floors, paint colors, and lighting setup.
        """
        prompt_lower = prompt.lower()
        width = dimensions.get("width", 5.0)
        length = dimensions.get("length", 4.0)
        height = dimensions.get("height", 2.8)

        # Base style detection
        style = "Scandinavian"
        if "mid-century" in prompt_lower or "retro" in prompt_lower or "modernist" in prompt_lower:
            style = "Mid-Century Modern"
        elif "industrial" in prompt_lower or "loft" in prompt_lower or "brick" in prompt_lower:
            style = "Industrial"
        elif "office" in prompt_lower or "work" in prompt_lower:
            style = "Office"
        elif "bedroom" in prompt_lower:
            style = "Bedroom"

        # Theme palettes
        themes = {
            "Scandinavian": {
                "wall_color": "#F3F4F6", # off-white
                "floor_material": "light_oak_wood",
                "ambient_color": "#FFFFFF",
                "ambient_intensity": 0.8,
                "accent_color": "#4B5563",
                "finishes": ["Matte", "Satin"]
            },
            "Mid-Century Modern": {
                "wall_color": "#E5E7EB",
                "floor_material": "walnut_wood",
                "ambient_color": "#FFFBEB", # warm light
                "ambient_intensity": 0.7,
                "accent_color": "#D97706", # amber
                "finishes": ["Matte"]
            },
            "Industrial": {
                "wall_color": "#78350F", # brick red or raw concrete
                "floor_material": "concrete_gray",
                "ambient_color": "#F3F4F6",
                "ambient_intensity": 0.5,
                "accent_color": "#1F2937", # dark grey/black
                "finishes": ["Matte"]
            },
            "Office": {
                "wall_color": "#FFFFFF",
                "floor_material": "gray_carpet",
                "ambient_color": "#F0FDFA", # high brightness cool
                "ambient_intensity": 0.9,
                "accent_color": "#0D9488",
                "finishes": ["Satin"]
            },
            "Bedroom": {
                "wall_color": "#F0F9FF", # soft blue/white
                "floor_material": "oak_wood",
                "ambient_color": "#FEF3C7", # warm cozy light
                "ambient_intensity": 0.6,
                "accent_color": "#4338CA",
                "finishes": ["Matte"]
            }
        }

        theme = themes.get(style, themes["Scandinavian"])

        # Create basic bounding walls
        # Origin is center of canvas (0, 0)
        half_w = width / 2
        half_l = length / 2

        walls = [
            {"id": "w1", "start": {"x": -half_w, "y": -half_l}, "end": {"x": half_w, "y": -half_l}},
            {"id": "w2", "start": {"x": half_w, "y": -half_l}, "end": {"x": half_w, "y": half_l}},
            {"id": "w3", "start": {"x": half_w, "y": half_l}, "end": {"x": -half_w, "y": half_l}},
            {"id": "w4", "start": {"x": -half_w, "y": half_l}, "end": {"x": -half_w, "y": -half_l}}
        ]

        items = []

        # Helper to push catalog objects onto layout coordinates
        # Position is {x, y, z} relative to center
        if style == "Bedroom":
            # Bed at the center of back wall (w1)
            items.append({
                "id": "bed_1",
                "name": "King Size Bed",
                "category": "bedroom",
                "x": 0.0,
                "y": 0.35, # Z-height is handled, in 2D layout y matches Z or depth. Here we use 2D canvas coordinates x, y
                "z": -half_l + 1.1, # Clamped towards the top wall
                "rotation": 0,
                "width": 1.9,
                "depth": 2.1,
                "height": 1.1,
                "color": "#E5E7EB",
                "material": "fabric",
                "price": 899.00
            })
            # Nightstands
            items.append({
                "id": "nightstand_l",
                "name": "Oak Nightstand Left",
                "category": "bedroom",
                "x": -1.3,
                "y": 0.25,
                "z": -half_l + 0.5,
                "rotation": 0,
                "width": 0.5,
                "depth": 0.4,
                "height": 0.5,
                "color": "#D1A377" if style == "Scandinavian" else "#5C4033",
                "material": "wood",
                "price": 120.00
            })
            items.append({
                "id": "nightstand_r",
                "name": "Oak Nightstand Right",
                "category": "bedroom",
                "x": 1.3,
                "y": 0.25,
                "z": -half_l + 0.5,
                "rotation": 0,
                "width": 0.5,
                "depth": 0.4,
                "height": 0.5,
                "color": "#D1A377" if style == "Scandinavian" else "#5C4033",
                "material": "wood",
                "price": 120.00
            })
            # Wardrobe along side wall (w4)
            items.append({
                "id": "wardrobe_1",
                "name": "Three-Door Wardrobe",
                "category": "bedroom",
                "x": -half_w + 0.6,
                "y": 1.0,
                "z": 0.0,
                "rotation": 90,
                "width": 1.5,
                "depth": 0.6,
                "height": 2.0,
                "color": "#FFFFFF",
                "material": "wood",
                "price": 450.00
            })
        elif style == "Office":
            # Desk center-back facing entrance
            items.append({
                "id": "desk_1",
                "name": "Executive Wooden Desk",
                "category": "office",
                "x": 0.0,
                "y": 0.38,
                "z": -0.5,
                "rotation": 0,
                "width": 1.6,
                "depth": 0.8,
                "height": 0.75,
                "color": "#8B5A2B",
                "material": "wood",
                "price": 320.00
            })
            # Ergonomic office chair
            items.append({
                "id": "chair_1",
                "name": "Ergonomic Mesh Chair",
                "category": "office",
                "x": 0.0,
                "y": 0.45,
                "z": -1.2,
                "rotation": 0,
                "width": 0.65,
                "depth": 0.65,
                "height": 0.9,
                "color": "#111827",
                "material": "plastic",
                "price": 249.00
            })
            # Bookshelf along wall (w2)
            items.append({
                "id": "bookshelf_1",
                "name": "Tall Bookshelf Unit",
                "category": "office",
                "x": half_w - 0.35,
                "y": 0.9,
                "z": 0.5,
                "rotation": 270,
                "width": 1.2,
                "depth": 0.35,
                "height": 1.8,
                "color": "#4B5563",
                "material": "wood",
                "price": 180.00
            })
            # Plant in corner
            items.append({
                "id": "plant_1",
                "name": "Potted Fiddle Leaf Fig",
                "category": "decor",
                "x": -half_w + 0.5,
                "y": 0.6,
                "z": -half_l + 0.5,
                "rotation": 45,
                "width": 0.6,
                "depth": 0.6,
                "height": 1.4,
                "color": "#10B981",
                "material": "plastic",
                "price": 65.00
            })
        else:
            # Default to Living Room configuration
            # Sofa facing center/TV
            items.append({
                "id": "sofa_1",
                "name": "3-Seater Comfort Sofa",
                "category": "living_room",
                "x": 0.0,
                "y": 0.42,
                "z": 1.0,
                "rotation": 180,
                "width": 2.2,
                "depth": 0.95,
                "height": 0.85,
                "color": "#6B7280" if style == "Scandinavian" else "#9A3412" if style == "Mid-Century Modern" else "#374151",
                "material": "fabric",
                "price": 750.00
            })
            # Coffee table in front of sofa
            items.append({
                "id": "coffee_table_1",
                "name": "Minimalist Coffee Table",
                "category": "living_room",
                "x": 0.0,
                "y": 0.2,
                "z": -0.1,
                "rotation": 0,
                "width": 1.1,
                "depth": 0.6,
                "height": 0.4,
                "color": "#D1A377" if style == "Scandinavian" else "#8B5A2B",
                "material": "wood",
                "price": 150.00
            })
            # TV Unit along the front wall (w1)
            items.append({
                "id": "tv_unit_1",
                "name": "Lowboard Media Console",
                "category": "living_room",
                "x": 0.0,
                "y": 0.25,
                "z": -half_l + 0.4,
                "rotation": 0,
                "width": 1.8,
                "depth": 0.45,
                "height": 0.5,
                "color": "#1F2937",
                "material": "wood",
                "price": 280.00
            })
            # Floor lamp
            items.append({
                "id": "lamp_1",
                "name": "Arc Floor Lamp",
                "category": "lighting",
                "x": -1.4,
                "y": 0.9,
                "z": 1.1,
                "rotation": 135,
                "width": 0.4,
                "depth": 0.4,
                "height": 1.8,
                "color": "#F3F4F6",
                "material": "metal",
                "price": 110.00
            })
            # Plant next to TV Unit
            items.append({
                "id": "plant_2",
                "name": "Monstera Deliciosa",
                "category": "decor",
                "x": 1.3,
                "y": 0.5,
                "z": -half_l + 0.5,
                "rotation": 0,
                "width": 0.5,
                "depth": 0.5,
                "height": 1.0,
                "color": "#059669",
                "material": "plastic",
                "price": 45.00
            })

        # Add windows & doors on walls automatically
        openings = [
            {
                "id": "door_1",
                "type": "door",
                "wall_id": "w3", # Front entry door in bottom wall
                "distance": width / 2 - 1.0, # distance from wall start
                "width": 0.9,
                "height": 2.1,
                "style": "single"
            },
            {
                "id": "window_1",
                "type": "window",
                "wall_id": "w2", # Window in right side wall
                "distance": length / 2,
                "width": 1.5,
                "height": 1.4,
                "style": "french"
            }
        ]

        # Lighting system properties
        lights = [
            {
                "id": "ambient",
                "type": "ambient",
                "color": theme["ambient_color"],
                "intensity": theme["ambient_intensity"]
            },
            {
                "id": "sunlight",
                "type": "directional",
                "color": "#FFFBEB",
                "intensity": 1.2,
                "position": {"x": 5.0, "y": 10.0, "z": 5.0},
                "cast_shadows": True
            },
            {
                "id": "ceiling_point",
                "type": "point",
                "color": "#FFFBEB" if style == "Mid-Century Modern" else "#FFFFFF",
                "intensity": 0.6,
                "position": {"x": 0.0, "y": height - 0.2, "z": 0.0},
                "cast_shadows": True
            }
        ]

        return {
            "style": style,
            "wall_color": theme["wall_color"],
            "wall_finish": theme["finishes"][0],
            "floor_material": theme["floor_material"],
            "walls": walls,
            "items": items,
            "openings": openings,
            "lights": lights,
            "dimensions": dimensions,
            "units": units
        }
