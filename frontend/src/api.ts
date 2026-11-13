import type { Commute, Route,  RouteStats, RouteUpdate, CommuteUpdate, CommuteCreate, RouteCreate } from "./types";

const BASE = "http://localhost:8000";


async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: {"Content-Type": "application/json"},
        ...options
  
    })
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ? JSON.stringify(body.detail): `Blad ${res.status}`)
    }
    return res.status === 204 ? (undefined as T): res.json();
}


    export const api = {
        getRoutes: () => request<Route[]>("/routes"),
        getRouteStats: (id: number) => request<RouteStats>(`/routes/${id}/stats`),
        createRoute: (data: RouteCreate) => request<Route>("/routes", {method: "POST", body: JSON.stringify(data)}),
        deleteRoute: (id: number) => request<void>(`/routes/${id}`, {method: "DELETE"}),
        updateRoute: (id: number, data: RouteUpdate) => request<Route>(`/routes/${id}`, {method: "PATCH", body: JSON.stringify(data)}),
        getCommute: (routeId: number) => request<Commute[]>(`/commute/>route_id${routeId}`),
        updateCommute: (id: number, data: CommuteUpdate) => request<Commute>(`/commute/${id}`, {method: "PATCH", body: JSON.stringify(data)}),
        createCommute: (data: CommuteCreate) => request<Commute>("/commute", {method: "POST", body: JSON.stringify(data)}),
        deleteCommute: (id: number) => request<void>(`/commute/${id}`, {method: "DELETE"})

    }
