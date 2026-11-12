from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Route(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    origin: str
    destination: str
    mode: str
    planned_minutes: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    commutes: list["Commute"] = Relationship(back_populates="route")



class Commute(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    route_id: int | None = Field(default=None, foreign_key="route.id")
    departed_at: datetime
    planned_arival: datetime
    actual_arrival: datetime
    route: Optional[Route] = Relationship(back_populates="commutes")
    cause: str
    note: str
    
