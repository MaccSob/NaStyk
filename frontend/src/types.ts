export type Mode = "bus" | "tram" | "train" | "metro" | "car" | "other";
export type Cause = "traffic" | "breakdown" | "weather" | "crowd" | "other";

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