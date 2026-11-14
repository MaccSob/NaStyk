import { useEffect, useState } from "react";
import { api } from "./api";
import { type RouteCreate, type Route, type RouteStats, type Mode, MODES,} from "./types";
import { MODE_LABELS } from "./types";
import CommuteList from "./CommuteList";
import CommuteForm from "./commuteForm";

interface RouteWithStats extends Route {
  stats: RouteStats;
}

export default function App() {
  const [form, setForm] = useState<RouteCreate>({
    name: "", origin: "", destination: "", mode: "tram", planned_minutes: 30,
  });
  const [routes, setRoutes] = useState<RouteWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


async function loadRoutes() {
  try {
    const list = await api.getRoutes();
    const withStats = await Promise.all(
      list.map(async (r) => ({ ...r, stats: await api.getRouteStats(r.id) }))
    );
    setRoutes(withStats);
    setError(null);

  } catch (e) {
    setError(e instanceof Error ? e.message : "Nieznany błąd");
  } finally {
    setLoading(false);
  }
}


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.createRoute(form);
      setForm({name: "", origin: "", destination: "", mode: "tram", planned_minutes: 30,
  });
  await loadRoutes();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nie udalo sie dodac trasy");
      
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Usunac trase wraz ze wszystkimi jej przejazdami?")) return;
    try {
      await api.deleteRoute(id);
      await loadRoutes();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nie udalo sie usunac trasy");
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getRoutes();
        const withStats = await Promise.all(
          list.map(async (r) => ({ ...r, stats: await api.getRouteStats(r.id) }))
        );
        setRoutes(withStats);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nieznany błąd");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p>Ładowanie…</p>;

  return (
    <main>
      <h1>Na styk</h1>

    {error && (
      <p role="alert">
        {error}<button onClick={() => setError(null)}>x</button>
      </p>
    )}

      <form onSubmit={handleSubmit}>
          <input
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          required
          placeholder="Nazwa"
          />
          <input
          value={form.origin}
          onChange={(e) => setForm({...form, origin: e.target.value})}
          required
          placeholder="Skąd"
          />
          <input
          value={form.destination}
          onChange={(e) => setForm({...form, destination: e.target.value})}
          required
          placeholder="Dokąd"
          />
          <select
          value={form.mode}
          onChange={(e) => setForm({...form, mode: e.target.value as Mode})}
          >
          
            {MODES.map((m) => (
              <option key={m} value={m}>{MODE_LABELS[m]}</option>
            ))}
            </select>
            <input
            type="number"
            min={1}
            value={form.planned_minutes}
            onChange={(e) => setForm({...form, planned_minutes: Number(e.target.value)})}
            placeholder="Planowany czas (min)"
            required
            />
            <button type="submit">Dodaj trase</button>

          </form>

      {routes.length === 0 && <p>Brak tras. Dodaj pierwszą.</p>}
      {routes.map((r) => (
        <article key={r.id}>
          <h2>{r.name}</h2>
          <p>{r.origin} → {r.destination} ({r.mode}), planowo {r.planned_minutes} min</p>
          {r.stats.count === 0 ? (
            <p>Brak przejazdów, nie ma jeszcze z czego liczyć zapasu.</p>
          ) : (
            <>
              <p>Zapas: <strong>{r.stats.recommended_buffer_min} min</strong>
                 (w 9 na 10 dni wystarczy {r.planned_minutes + (r.stats.recommended_buffer_min ?? 0)} min)</p>
              <p>Na czas: {r.stats.on_time_pct}% • średnie opóźnienie: {r.stats.avg_delay_min} min</p>
            </>
          )}
                      <button onClick={() => handleDelete(r.id)}>Usun</button>
                      <CommuteList routeId={r.id} count={r.stats.count} onChanged={loadRoutes}/>
                      <CommuteForm routeId={r.id} onCreated={loadRoutes}/>

        </article>
       
      ))}
    </main>
  );
}