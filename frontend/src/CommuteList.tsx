import { useEffect, useState } from "react";
import { api } from "./api";
import { CAUSE_LABELS } from "./types";
import type { Commute } from "./types";

interface Props {
  routeId: number;
  count: number; 
  onChanged: () => void;
}

export default function CommuteList({ routeId, count, onChanged }: Props) {
  const [commutes, setCommute] = useState<Commute[]>([]);

  useEffect(() => {
    api.getCommute(routeId).then(setCommute).catch(() => setCommute([]));
  }, [routeId, count]);

  async function handleDelete(id: number) {
    if (!window.confirm("Usunąć przejazd?")) return;
    await api.deleteCommute(id);
    onChanged();
  }

  if (commutes.length === 0) return null;

  return (
    <ul>
      {commutes.map((c) => {
        const delay = Math.round(
          (new Date(c.actual_arrival).getTime() - new Date(c.planned_arrival).getTime()) / 60000
        );
        return (
          <li key={c.id}>
            {new Date(c.planned_arrival).toLocaleDateString("pl-PL")}:{" "}
            {delay > 0 ? `+${delay} min` : delay < 0 ? `${delay} min (przed czasem)` : "punktualnie"}
            {c.cause && ` (${CAUSE_LABELS[c.cause]})`}
            <button onClick={() => handleDelete(c.id)}>Usuń</button>
          </li>
        );
      })}
    </ul>
  );
}