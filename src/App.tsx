import { useEffect, useState } from "react";
import {
  login,
  register,
  fetchMatches,
  fetchMyPredictions,
  savePredictions,
  fetchPoints,
  fetchLeaderboard,
  fetchGroupStandings
} from "./api";
import { Match, Prediction } from "./types";
import "./styles.css";

interface LeaderboardRow {
  id: number;
  username: string;
  total_points: number;
}

function App() {
  const [view, setView] = useState<"login" | "register">("login");
  const [tab, setTab] = useState<"matches" | "dashboard" | "groups">("matches");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [preds, setPreds] = useState<Record<number, Prediction>>({});
  const [points, setPoints] = useState<{ totalPoints: number; perMatch: any[] } | null>(null);

  const [banner, setBanner] = useState<{ type: "error" | "success"; msg: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [groupTable, setGroupTable] = useState<any[]>([]);

  async function loadData() {
    try {
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
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (loggedIn && tab === "dashboard") {
      fetchLeaderboard()
        .then(setLeaderboard)
        .catch(() => {
          setBanner({ type: "error", msg: "Failed to load leaderboard" });
        });
    }
  }, [tab, loggedIn]);

  useEffect(() => {
    if (loggedIn && tab === "groups") {
      fetchGroupStandings()
        .then(setGroupTable)
        .catch(() => {
          setBanner({ type: "error", msg: "Failed to load groups table" });
        });
    }
  }, [tab, loggedIn]);

  async function handleLogin() {
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      setLoggedIn(true);
      loadData();
    } catch {
      setBanner({ type: "error", msg: "Login failed" });
    }
  }

  async function handleRegister() {
    try {
      const res = await register(username, password);
      localStorage.setItem("token", res.token);
      setLoggedIn(true);
      setBanner({ type: "success", msg: "Registration successful!" });
      loadData();
    } catch {
      setBanner({ type: "error", msg: "Registration failed" });
    }
  }

  function updatePrediction(matchId: number, field: "home" | "away", value: number) {
    setPreds((prev) => ({
      ...prev,
      [matchId]: {
        matchId,
        home: field === "home" ? value : prev[matchId]?.home ?? 0,
        away: field === "away" ? value : prev[matchId]?.away ?? 0
      }
    }));
  }

  async function saveAll() {
    try {
      const arr = Object.values(preds);
      await savePredictions(arr);
      setBanner({ type: "success", msg: "Predictions saved!" });
      const pts = await fetchPoints();
      setPoints(pts);
    } catch {
      setBanner({ type: "error", msg: "Error saving predictions" });
    }
  }

  // --------------------------
  // LOGIN PAGE
  // --------------------------
  if (!loggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-card card">
          <div className="auth-toggle">
            <button
              className={`auth-tab ${view === "login" ? "active" : ""}`}
              onClick={() => setView("login")}
            >
              Login
            </button>
            <button
              className={`auth-tab ${view === "register" ? "active" : ""}`}
              onClick={() => setView("register")}
            >
              Register
            </button>
          </div>

          {banner && (
            <div className={banner.type === "error" ? "error-banner" : "success-banner"}>
              {banner.msg}
            </div>
          )}

          <h2 className="title">{view === "login" ? "Welcome Back" : "Create Account"}</h2>
          <p className="subtitle">Predict matches & compete with friends!</p>

          <div className="auth-form">
            <label className="form-label">
              Username
              <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>

            <label className="form-label">
              Password
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {view === "login" ? (
              <button className="btn-primary" onClick={handleLogin}>
                Login
              </button>
            ) : (
              <button className="btn-primary" onClick={handleRegister}>
                Register
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // MAIN APP VIEW
  // --------------------------
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">⚽ Tournament Bets</div>
        <div className="header-right">
          <span className="username">Hi, {username}</span>
          <button className="btn-outline" onClick={() => window.location.reload()}>
            Logout
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === "matches" ? "active" : ""}`} onClick={() => setTab("matches")}>
            Matches
          </button>

          <button className={`tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>
            Dashboard
          </button>

          <button className={`tab ${tab === "groups" ? "active" : ""}`} onClick={() => setTab("groups")}>
            Groups
          </button>
        </div>

        {banner && (
          <div className={banner.type === "error" ? "error-banner" : "success-banner"}>{banner.msg}</div>
        )}

        {/* MATCHES */}
        {tab === "matches" && (
          <>
            <div className="card card-m-bottom">
              <h3 className="card-title">Group & Knockout Matches</h3>
              <div className="matches-grid">
                {matches.map((m) => (
                  <div key={m.id} className="match-card">
                    <div className="match-header">
                      <span className="pill pill-stage">{m.stage}</span>
                      <span className="match-date">{new Date(m.kickoff_at).toLocaleString()}</span>
                    </div>

                    <div className="teams-row">
                      <span className="team-name">{m.home_team_name}</span>
                      <span className="vs">vs</span>
                      <span className="team-name">{m.away_team_name}</span>
                    </div>

                    <div className="prediction-row">
                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        value={preds[m.id]?.home ?? ""}
                        onChange={(e) => updatePrediction(m.id, "home", Number(e.target.value))}
                      />

                      <input
                        className="score-input"
                        type="number"
                        min="0"
                        value={preds[m.id]?.away ?? ""}
                        onChange={(e) => updatePrediction(m.id, "away", Number(e.target.value))}
                      />
                    </div>

                    <div className="result-row">
                      Result:{" "}
                      {m.result_home !== null ? `${m.result_home} - ${m.result_away}` : "Not Played"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="actions-row">
                <button className="btn-primary" onClick={saveAll}>
                  Save Predictions
                </button>
              </div>
            </div>
          </>
        )}

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <>
            {points && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Your Total Points</div>
                  <div className="stat-value">{points.totalPoints}</div>
                </div>
              </div>
            )}

            <div className="card card-m-top">
              <h3 className="card-title">Leaderboard</h3>

              <table className="table-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td>{u.username}</td>
                      <td>{u.total_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* GROUPS */}
        {tab === "groups" && (
          <div className="card card-m-top">
            <h3 className="card-title">Group Standings</h3>

            {groupTable.length === 0 ? (
              <p className="groups-empty">No group data yet</p>
            ) : (
              <table className="table-full">
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Team</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {groupTable.map((t, idx) => (
                    <tr key={idx}>
                      <td>{t.group_name}</td>
                      <td>{t.team_name}</td>
                      <td>{t.goals_for}</td>
                      <td>{t.goals_against}</td>
                      <td>{t.goals_for - t.goals_against}</td>
                      <td>{t.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">© 2025 Tournament Predictor — All Rights Reserved</footer>
    </div>
  );
}

export default App;