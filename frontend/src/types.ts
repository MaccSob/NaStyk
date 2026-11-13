export const MODES  = ["bus",  "tram",  "train",  "metro", "car", "other"] as const;
export const CAUSES = ["traffic", "breakdown", "weather", "crowd", "other"] as const;
export type Mode = (typeof MODES)[number];
export type Cause = (typeof CAUSES)[number];

export type RouteCreate = Omit<Route, "id" | "created_at">;
export type RouteUpdate = Partial<RouteCreate>;

export type CommuteCreate = Omit<Commute, "id">;
export type CommuteUpdate = Partial<CommuteCreate>;

export const MODE_LABELS: Record<Mode, string> = {
    bus: "Autobus", tram: "Tramwaj", train: 'Pociag',
    metro: "Metro", car: "Samochod", other: "Inne",
};
export const CAUSE_LABELS: Record<Cause, string> = {
    traffic: "Korek", breakdown: "Awaria", weather: 'Pogoda',
    crowd: "Tlum", other: "Inne",
};


export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  mode: Mode;
  planned_minutes: number;
  created_at: string;
}

export interface RouteStats {
  count: number;
  avg_delay_min: number | null;
  on_time_pct: number | null;
  p90_delay_min: number | null;
  recommended_buffer_min: number | null;
}

export interface Commute {
  id: number;
  route_id: number;
  departed_at: string;
  planned_arrival: string;
  actual_arrival: string;
  cause: Cause | null;
  note: string | null;
}