import { useEffect, useState } from "react";
import { login, register, fetchMatches, fetchMyPredictions, savePredictions, fetchPoints } from "./api";
import { Match, Prediction } from "./types";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [preds, setPreds] = useState<Record<number, Prediction>>({});
  const [points, setPoints] = useState<{ totalPoints: number; perMatch: any[] } | null>(null);

  // הימורים לא נעולים כרגע — פתוח לכל המשתמשים
  const locked = false;

  // טעינת נתונים לאחר התחברות
  async function loadData() {
    const m = await fetchMatches();
    setMatches(m);

    const my = await fetchMyPredictions();
    const mapped: Record<number, Prediction> = {};
    my.forEach((p) => {
      mapped[p.match_id] = {
        matchId: p.match_id,
        home: p.predicted_home,
        away: p.predicted_away
      };
    });
    setPreds(mapped);

    const pts = await fetchPoints();
    setPoints(pts);
  }

  async function handleLogin() {
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      setLoggedIn(true);
      loadData();
    } catch (err) {
      alert("Login failed");
    }
  }

  async function handleRegister() {
    try {
      const res = await register(username, password);
      localStorage.setItem("token", res.token);
      setLoggedIn(true);
      loadData();
    } catch (err) {
      alert("Register failed");
    }
  }

  function updatePrediction(matchId: number, field: "home" | "away", value: number) {
    setPreds((prev) => ({
      ...prev,
      [matchId]: {
        matchId,
        home: field === "home" ? value : (prev[matchId]?.home ?? 0),
        away: field === "away" ? value : (prev[matchId]?.away ?? 0)
      }
    }));
  }

  async function saveAll() {
    const arr = Object.values(preds);
    await savePredictions(arr);
    alert("Saved!");
    const pts = await fetchPoints();
    setPoints(pts);
  }

  if (!loggedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login / Register</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister} style={{ marginLeft: 10 }}>
          Register
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Matches & Predictions</h2>

      <button onClick={saveAll} disabled={locked}>
        Save Predictions
      </button>

      <br /><br />

      {matches.map((m) => (
        <div key={m.id} style={{ marginBottom: 12 }}>
          <strong>
            {m.home_team_id} vs {m.away_team_id}
          </strong>
          <br />

          <input
            type="number"
            value={preds[m.id]?.home ?? ""}
            placeholder="Home"
            disabled={locked}
            min={0}
            onChange={(e) => updatePrediction(m.id, "home", Number(e.target.value))}
          />

          <input
            type="number"
            value={preds[m.id]?.away ?? ""}
            placeholder="Away"
            disabled={locked}
            min={0}
            style={{ marginLeft: 10 }}
            onChange={(e) => updatePrediction(m.id, "away", Number(e.target.value))}
          />
        </div>
      ))}

      <hr />

      <h3>Points</h3>
      {points && (
        <div>
          <p>Total: {points.totalPoints}</p>
        </div>
      )}
    </div>
  );
}

export default App;