from datetime import datetime, timedelta

ROUTE = {"name": "Dom - praca", "origin": "A", "destination": "B",
         "mode": "tram", "planned_minutes": 30}


def make_route(client):
    return client.post("/routes", json=ROUTE).json()["id"]


def add_commute(client, route_id, delay_min):
    planned = datetime(2026, 11, 2, 8, 0)
    return client.post("/commute", json={
        "route_id": route_id,
        "departed_at": (planned - timedelta(minutes=30)).isoformat(),
        "planned_arrival": planned.isoformat(),
        "actual_arrival": (planned + timedelta(minutes=delay_min)).isoformat(),
    })


def test_create_route(client):
    res = client.post("/routes", json=ROUTE)
    assert res.status_code == 201
    assert res.json()["name"] == "Dom - praca"


def test_stats_empty_route(client):
    route_id = make_route(client)
    stats = client.get(f"/routes/{route_id}/stats").json()
    assert stats["count"] == 0
    assert stats["recommended_buffer_min"] is None


def test_stats_ten_commutes(client):
    route_id = make_route(client)
    for delay in [0, 0, 2, 3, 5, 5, 8, 10, 12, 20]:
        add_commute(client, route_id, delay)
    stats = client.get(f"/routes/{route_id}/stats").json()
    assert stats["count"] == 10
