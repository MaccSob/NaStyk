import { useState } from "react";
import { api } from "./api";
import { CAUSES, CAUSE_LABELS } from "./types";
import type { Cause } from "./types";

interface Props {
  routeId: number;
  onCreated: () => void;
}

export default function CommuteForm({ routeId, onCreated }: Props) {
  const [departedAt, setDepartedAt] = useState("");
  const [plannedArrival, setPlannedArrival] = useState("");
  const [actualArrival, setActualArrival] = useState("");
  const [cause, setCause] = useState<Cause | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (actualArrival < departedAt) {
      setError("Przyjazd nie może być wcześniejszy niż wyjazd");
      return;
    }
    try {
      await api.createCommute({
        route_id: routeId,
        departed_at: departedAt,
        planned_arrival: plannedArrival,
        actual_arrival: actualArrival,
        cause,
        note: note || null,
      });
      setDepartedAt("");
      setPlannedArrival("");
      setActualArrival("");
      setCause(null);
      setNote("");
      setError(null);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się dodać przejazdu");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p role="alert">{error}</p>}
      <label>Wyjazd
        <input type="datetime-local" value={departedAt}
          onChange={(e) => setDepartedAt(e.target.value)} required />
      </label>
      <label>Planowany przyjazd
        <input type="datetime-local" value={plannedArrival}
          onChange={(e) => setPlannedArrival(e.target.value)} required />
      </label>
      <label>Faktyczny przyjazd
        <input type="datetime-local" value={actualArrival}
          onChange={(e) => setActualArrival(e.target.value)} required />
      </label>
      <label>Przyczyna opóźnienia
        <select value={cause ?? ""}
          onChange={(e) => setCause(e.target.value === "" ? null : (e.target.value as Cause))}>
          <option value="">Brak</option>
          {CAUSES.map((c) => (
            <option key={c} value={c}>{CAUSE_LABELS[c]}</option>
          ))}
        </select>
      </label>
      <label>Notatka
        <input value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button type="submit">Dodaj przejazd</button>
    </form>
  );
}