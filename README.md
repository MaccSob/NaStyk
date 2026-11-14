# Na styk

Dziennik punktualności dojazdów. Zapisujesz swoje stałe trasy (np. dom → praca)
i po każdym przejeździe logujesz, czy się spóźniłeś. Aplikacja liczy, ile zapasu
naprawdę potrzeba, żeby być na czas: zamiast "podróż trwa 30 min" dostajesz
"w 9 na 10 dni wystarczy 40 min".

Projekt zrealizowany jako Full-Stack MVP o tematyce transportowej.

## Pomysł

Rozkład jazdy mówi, ile podróż *powinna* trwać. Ta aplikacja pokazuje, ile trwa
*naprawdę*. Dla każdej trasy liczy średnie opóźnienie, odsetek przejazdów na czas
i **90. percentyl opóźnienia**, z którego wynika zalecany zapas czasu.

## Stack

- **Backend:** Python, FastAPI, SQLModel, SQLite
- **Frontend:** React, TypeScript, Vite
- **Testy:** pytest

## Funkcje

- CRUD tras (nazwa, skąd, dokąd, środek transportu, planowany czas)
- CRUD przejazdów (czas wyjazdu, planowany i faktyczny przyjazd, przyczyna opóźnienia, notatka)
- Statystyki trasy: średnie opóźnienie, % przejazdów na czas, p90, zalecany zapas
- Karta trasy z informacją "Wyjdź X min przed czasem"
- Usunięcie trasy usuwa też jej przejazdy (po potwierdzeniu)

## Uruchomienie

Wymagania: Python 3.11+, Node.js 20+.

### Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Serwer działa na `http://localhost:8000`, a dokumentacja API (Swagger) jest pod
`http://localhost:8000/docs`. Plik bazy `nastyk.db` tworzy się automatycznie.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikacja działa na `http://localhost:5173` (backend musi być uruchomiony).

### Testy

```bash
cd backend
python -m pytest -v
```

## API

### Trasy (`/routes`)

| Metoda | Ścieżka | Opis | Kody |
|---|---|---|---|
| POST | `/routes` | utwórz trasę | 201, 422 |
| GET | `/routes` | lista tras (`offset`, `limit`) | 200 |
| GET | `/routes/{id}` | pojedyncza trasa | 200, 404 |
| PATCH | `/routes/{id}` | częściowa zmiana | 200, 404, 422 |
| DELETE | `/routes/{id}` | usuń trasę wraz z przejazdami | 204, 404 |
| GET | `/routes/{id}/stats` | statystyki trasy | 200, 404 |

### Przejazdy (`/commute`)

| Metoda | Ścieżka | Opis | Kody |
|---|---|---|---|
| POST | `/commute` | zapisz przejazd | 201, 404, 422 |
| GET | `/commute` | lista (`route_id`, `offset`, `limit`) | 200 |
| GET | `/commute/{id}` | pojedynczy przejazd | 200, 404 |
| PATCH | `/commute/{id}` | częściowa zmiana | 200, 404, 422 |
| DELETE | `/commute/{id}` | usuń przejazd | 204, 404 |

## Model danych

**Route:** `id`, `name`, `origin`, `destination`, `mode`
(`bus` / `tram` / `train` / `metro` / `car` / `other`), `planned_minutes`, `created_at`

**Commute:** `id`, `route_id`, `departed_at`, `planned_arrival`, `actual_arrival`,
`cause` (opcjonalne: `traffic` / `breakdown` / `weather` / `crowd` / `other`),
`note` (opcjonalne)

## Decyzje projektowe

- **Opóźnienie nie jest zapisane w bazie.** Przechowuję `planned_arrival` i
  `actual_arrival`, a opóźnienie wynika z ich różnicy. Dzięki temu dane nie mogą
  się rozjechać po edycji.
- **Zapas liczony percentylem, nie średnią.** Średnia ukrywa rzadkie, ale
  dotkliwe opóźnienia, a pytanie brzmi: "ile zapasu wystarczy w 9 dniach na 10".
  Zalecany zapas to p90 opóźnienia, nie mniej niż 0. Przykład: przy opóźnieniach
  `0, 0, 2, 3, 5, 5, 8, 10, 12, 20` średnia wynosi 6,5 min, a p90 to 12 min.
- **Przejazd jest "na czas", gdy opóźnienie ≤ 0 min.**
- **Osobne schematy** dla tworzenia, aktualizacji i odczytu (`Create` / `Update` /
  `Read`) zamiast jednego modelu do wszystkiego.
- **Usunięcie trasy usuwa jej przejazdy** (w jednej transakcji), a frontend prosi
  o potwierdzenie.
- **Daty przejazdów są przechowywane jako naive datetime** (czas lokalny), bo
  użytkownik podaje je bez strefy czasowej.
- **SQLite bez migracji.** Po zmianie modeli usuń plik `nastyk.db`.
- **Logika statystyk jest w osobnym module** (`stats.py`) jako czyste funkcje,
  dzięki czemu łatwo ją testować.

## Struktura

```
backend/
  app/
    main.py        # aplikacja FastAPI, CORS, routery
    database.py    # engine SQLite, sesja
    models.py      # tabele
    schemas.py     # schematy żądań i odpowiedzi
    stats.py       # obliczanie statystyk
    routers/       # routes.py, commutes.py
  tests/           # testy pytest (baza w pamięci)
  requirements.txt
frontend/
  src/
    api.ts         # klient API
    types.ts       # typy i listy dozwolonych wartości
    App.tsx        # lista tras, formularz trasy
    CommuteForm.tsx
    CommuteList.tsx
```

## Możliwe rozszerzenia

- Wpisywanie przejazdu jednym zdaniem z pomocą AI (model zamienia notatkę typu
  "wczoraj 8:12 zamiast 8:00, korek na rondzie" na wypełniony formularz)
- Edycja tras i przejazdów w interfejsie (API już to obsługuje)
- Wykres opóźnień w czasie
- Statystyki według dnia tygodnia i godziny wyjazdu

## Uwagi

Przy pracy korzystałem z asystenta AI (Claude) do konsultacji projektu, code review i debugowania. Kod napisałem i przetestowałem samodzielnie.
