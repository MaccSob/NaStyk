from math import ceil


def delay_minutes(commute) -> float:
    return (commute.actual_arrival - commute.planned_arrival).total_seconds() / 60


def percentile(values: list[float], p: int) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = ceil(p / 100 * len(ordered)) - 1
    return ordered[max(index, 0)]


def route_stats(commutes, tolerance_min: float = 0) -> dict:
    delays = [delay_minutes(c) for c in commutes]
    if not delays:
        return {"count": 0, "avg_delay_min": None, "on_time_pct": None,
                "p90_delay_min": None, "recommended_buffer_min": None}
    p90 = percentile(delays, 90)
    on_time = sum(1 for d in delays if d <= tolerance_min)
    return {
        "count": len(delays),
        "avg_delay_min": round(sum(delays) / len(delays), 1),
        "on_time_pct": round(100 * on_time / len(delays), 1),
        "p90_delay_min": round(p90, 1),
        "recommended_buffer_min": round(max(0, p90), 1),
    }