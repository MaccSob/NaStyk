from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Literal


class RouteCreate(SQLModel):
    name: str = Field(min_length=1, max_length=100)
    origin: str = Field(min_length=1, max_length=100)
    destination: str = Field(min_length=1, max_length=100)
    mode: Literal["bus", "tram", "train", "metro", "car", "other"]
    planned_minutes: int | None = Field(default=None, gt=0)


class RouteUpdate(SQLModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    origin: str | None = Field(default=None, min_length=1, max_length=100)
    destination: str | None = Field(default=None, min_length=1, max_length=100)
    mode: Literal["bus", "tram", "train", "metro", "car", "other"]
    planned_minutes: int | None = Field(default=None, gt=0)


class RouteRead(RouteCreate):
    id: int
    created_at: datetime

class CommuteCreate(SQLModel):
    route_id: int
    departed_at: datetime
    planned_arrival: datetime
    actual_arrival: datetime
    cause: Literal["traffic", "breakdown", "weather", "crowd", "other"] | None = None
    note: str | None = Field(default=None, max_length=500)

class CommuteUpdate(SQLModel):
    route_id: int | None = None
    departed_at: datetime | None = None
    planned_arrival: datetime | None = None
    actual_arrival: datetime | None = None
    cause: Literal["traffic", "breakdown", "weather", "crowd", "other"] | None = None
    note: str | None = Field(default=None, max_length=500)

class CommuteRead(CommuteCreate):
    id: int

class RouteStats(SQLModel):
    count: int
    avg_delay_min: float | None
    on_time_pct: float | None
    p90_delay_min: float | None
    recommended_buffer_min: float | None


