from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import ai, machines, simulations
from app.core.config import settings

app = FastAPI(title="EarthFrame API")

# CORS
# ---------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# FastAPI
# ---------------------------------
app.include_router(ai.router)
app.include_router(simulations.router)
app.include_router(machines.router)
