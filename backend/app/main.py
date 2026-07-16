from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
import uuid

from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, AIRoomRequest, CatalogItemResponse
from app.services.ai_service import AIService

app = FastAPI(
    title="RoomCraft Studio API",
    description="Backend API for RoomCraft Studio 2D/3D Planner",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mock database for rapid setup and execution
MOCK_PROJECTS = {}
MOCK_CATALOG = {
    "sofa_1": {
        "id": "sofa_1",
        "name": "3-Seater Comfort Sofa",
        "category": "living_room",
        "subcategory": "sofas",
        "thumbnail": "sofa.png",
        "dimensions": {"width": 2.2, "height": 0.85, "depth": 0.95},
        "default_color": "#4B5563",
        "default_material": "fabric",
        "price": 750.00,
        "brand": "SofaCraft"
    },
    "bed_1": {
        "id": "bed_1",
        "name": "King Size Bed",
        "category": "bedroom",
        "subcategory": "beds",
        "thumbnail": "bed.png",
        "dimensions": {"width": 1.9, "height": 1.1, "depth": 2.1},
        "default_color": "#E5E7EB",
        "default_material": "fabric",
        "price": 899.00,
        "brand": "SleepWell"
    },
    "desk_1": {
        "id": "desk_1",
        "name": "Executive Wooden Desk",
        "category": "office",
        "subcategory": "desk",
        "thumbnail": "desk.png",
        "dimensions": {"width": 1.6, "height": 0.75, "depth": 0.8},
        "default_color": "#8B5A2B",
        "default_material": "wood",
        "price": 320.00,
        "brand": "NordicWood"
    },
    "chair_1": {
        "id": "chair_1",
        "name": "Ergonomic Mesh Chair",
        "category": "office",
        "subcategory": "chair",
        "thumbnail": "chair.png",
        "dimensions": {"width": 0.65, "height": 0.9, "depth": 0.65},
        "default_color": "#111827",
        "default_material": "plastic",
        "price": 249.00,
        "brand": "ErgoFlex"
    }
}

# Add initial mock project for demo purposes
default_id = uuid.UUID("3c7b37d4-8d48-43e9-a3b0-0cb29ffeb8f2")
MOCK_PROJECTS[default_id] = {
    "id": default_id,
    "user_id": uuid.UUID("11111111-1111-1111-1111-111111111111"),
    "name": "Sample Living Room",
    "description": "My first design project in RoomCraft Studio",
    "settings": {"units": "meters", "gridSnap": True, "gridSize": 0.5},
    "scene_data": {
        "wall_color": "#F3F4F6",
        "wall_finish": "Matte",
        "floor_material": "light_oak_wood",
        "walls": [
            {"id": "w1", "start": {"x": -2.5, "y": -2.0}, "end": {"x": 2.5, "y": -2.0}},
            {"id": "w2", "start": {"x": 2.5, "y": -2.0}, "end": {"x": 2.5, "y": 2.0}},
            {"id": "w3", "start": {"x": 2.5, "y": 2.0}, "end": {"x": -2.5, "y": 2.0}},
            {"id": "w4", "start": {"x": -2.5, "y": 2.0}, "end": {"x": -2.5, "y": -2.0}}
        ],
        "items": [
            {
                "id": "item_1",
                "catalog_id": "sofa_1",
                "name": "3-Seater Comfort Sofa",
                "category": "living_room",
                "x": 0.0,
                "y": 0.42,
                "z": 1.0,
                "rotation": 180,
                "width": 2.2,
                "depth": 0.95,
                "height": 0.85,
                "color": "#4B5563",
                "material": "fabric"
            }
        ],
        "openings": [
            {"id": "door_1", "type": "door", "wall_id": "w3", "distance": 1.5, "width": 0.9, "height": 2.1, "style": "single"}
        ]
    },
    "thumbnail_url": None,
    "created_at": "2026-07-15T08:00:00Z",
    "updated_at": "2026-07-15T08:00:00Z"
}


@app.get("/")
def read_root():
    return {"message": "Welcome to RoomCraft Studio API. The backend is operational."}


# Projects Endpoints
@app.get("/api/projects", response_model=List[ProjectResponse])
def get_projects(user_id: Optional[UUID] = None):
    # Returns all projects
    return list(MOCK_PROJECTS.values())


@app.get("/api/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID):
    if project_id not in MOCK_PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")
    return MOCK_PROJECTS[project_id]


@app.post("/api/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, user_id: UUID = uuid.UUID("11111111-1111-1111-1111-111111111111")):
    new_id = uuid.uuid4()
    import datetime
    now_str = datetime.datetime.utcnow().isoformat() + "Z"
    
    project_dict = {
        "id": new_id,
        "user_id": user_id,
        "name": project_in.name,
        "description": project_in.description,
        "settings": project_in.settings,
        "scene_data": project_in.scene_data,
        "thumbnail_url": project_in.thumbnail_url,
        "created_at": now_str,
        "updated_at": now_str
    }
    
    MOCK_PROJECTS[new_id] = project_dict
    return project_dict


@app.put("/api/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: UUID, project_in: ProjectUpdate):
    if project_id not in MOCK_PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")
    
    p = MOCK_PROJECTS[project_id]
    
    if project_in.name is not None:
        p["name"] = project_in.name
    if project_in.description is not None:
        p["description"] = project_in.description
    if project_in.settings is not None:
        p["settings"] = project_in.settings
    if project_in.scene_data is not None:
        p["scene_data"] = project_in.scene_data
    if project_in.thumbnail_url is not None:
        p["thumbnail_url"] = project_in.thumbnail_url
        
    import datetime
    p["updated_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    
    MOCK_PROJECTS[project_id] = p
    return p


@app.delete("/api/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID):
    if project_id not in MOCK_PROJECTS:
        raise HTTPException(status_code=404, detail="Project not found")
    del MOCK_PROJECTS[project_id]
    return None


# Catalog Endpoints
@app.get("/api/catalog", response_model=List[CatalogItemResponse])
def get_catalog(category: Optional[str] = None):
    items = list(MOCK_CATALOG.values())
    if category:
        items = [i for i in items if i["category"] == category]
    return items


# AI Layout Suggestion Endpoint
@app.post("/api/ai/generate-layout")
def generate_ai_layout(request: AIRoomRequest):
    try:
        scene = AIService.generate_layout(
            prompt=request.prompt,
            dimensions=request.room_dimensions,
            units=request.units
        )
        return {"status": "success", "scene": scene}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
