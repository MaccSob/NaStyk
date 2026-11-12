import type { Route, RouteStats } from "./types";

const BASE = "http://localhost:8000";


async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}#{path}`, {
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
    }
