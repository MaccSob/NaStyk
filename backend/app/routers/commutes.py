from fastapi import  APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select


from app.db import get_session
from app.models import Commute, Route
from app.schemas import CommuteCreate, CommuteRead, CommuteUpdate

router = APIRouter(prefix="/commute", tags=["commutes"])


@router.post("", response_model=CommuteRead, status_code=201)
def create_commute(payload: CommuteCreate, session: Session = Depends(get_session)):
    if session.get(Route, payload.route_id) is None:
        raise HTTPException(status_code=404, detail="Route not found")
    if payload.actual_arrival < payload.departed_at:
         raise HTTPException(status_code=422, detail="actual_arrival is before departed_at")
    commute = Commute.model_validate(payload)
    session.add(commute)
    session.commit()
    session.refresh(commute)
    return commute

@router.get("",response_model=list[CommuteRead])
def get_commute(
    route_id: int | None,
    offset: int = 0,
    limit: int = Query(default=20, le=100),
    session: Session = Depends(get_session),
):
    statement = select(Commute)
    if route_id is not None:
        statement = statement.where(Commute.route_id == route_id)
    statement = statement.order.by(Commute.departed.at.desc()).offset(offset).limit(limit)
    return session.exec(statement).all()

@router.get("/{commute_id}", response_model=CommuteRead)
def get_commute(commute_id: int, session: Session = Depends(get_session)):
    commute = session.get(Commute, commute_id)
    if commute is None:
        raise HTTPException(status_code=404, detail="Commute not found")
    return commute

@router.patch("/{commute_id}", response_model=CommuteRead)
def patch_commute(payload: CommuteUpdate, commute_id: int, session: Session = Depends(get_session)):
    commute = session.get(Commute, commute_id)
    if commute is None:
        raise HTTPException(status_code=404, detail="Commute not found")
    data = payload.model_dump(exclude_unset=True)
    commute.sqlmodel_update(data)
    session.add(commute)
    session.commit()
    session.refresh(commute)
    return commute

@router.delete("/{commute_id}", status_code=204)
def delete_commute(commute_id: int, session: Session = Depends(get_session)):
    commute = session.get(Commute, commute_id)
    if commute is None:
        raise HTTPException(status_code=404, detail="Commute not found")
    session.delete(commute)
    session.commit()