from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.models import Route
from app.schemas import RouteCreate, RouteRead, RouteUpdate

router = APIRouter(prefix="/routes", tags=["routes"])

@router.post("", response_model=RouteRead, status_code=201)
def create_route(payload: RouteCreate, session: Session = Depends(get_session)):
    route = Route.model_validate(payload)
    session.add(route)
    session.commit()
    session.refresh(route)
    return route

@router.get("/{route_id}", response_model=RouteRead)
def get_route(route_id: int, session: Session = Depends(get_session)):
    route = session.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.get("", response_model=list[RouteRead])
def get_routes(offset: int = 0, limit = Query(default=20, le=100), session: Session = Depends(get_session)):
    routes = session.exec(select(Route).offset(offset).limit(limit).all())
    return routes



@router.patch("/{route_id}", response_model=RouteRead)
def patch_route(payload: RouteUpdate, route_id: int, session: Session = Depends(get_session)):
    route = session.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    data = payload.model_dump(exclude_unset=True)
    route.sqlmodel_update(data)
    session.add(route)
    session.commit()
    session.refresh(route)
    return route

@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, session: Session = Depends(get_session)):
    route = session.get(Route, route_id)
    if route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    if route.commutes:
        raise HTTPException(status_code=409, detail="Route has commutes")
    session.delete(route)
    session.commit()