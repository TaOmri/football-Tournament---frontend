import React, { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import MatchesList from './components/MatchesList';
import Dashboard from './components/Dashboard';
import { fetchMatches, fetchMyPredictions, savePredictions, fetchPoints } from './api';
import { Match } from './types';

type Tab = 'matches' | 'dashboard';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string>(localStorage.getItem('username') || '');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, { home: number; away: number }>>({});
  const [tab, setTab] = useState<Tab>('matches');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [locked, setLocked] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      bootstrap();
    }
  }, [token]);

  const bootstrap = async () => {
    try {
      setLoading(true);
      const [matchesData, predsData, pointsData] = await Promise.all([
        fetchMatches(),
        fetchMyPredictions(),
        fetchPoints(),
      ]);
      setMatches(matchesData);
      const preds: Record<number, { home: number; away: number }> = {};
      predsData.forEach(p => {
        preds[p.match_id] = { home: p.predicted_home, away: p.predicted_away };
      });
      setPredictions(preds);
      setTotalPoints(pointsData.totalPoints);

      const now = new Date();
      const futureMatches = matchesData.filter(m => new Date(m.kickoff_at) > now);
      setLocked(futureMatches.length === 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load data from server');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (newToken: string, newUsername: string) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername('');
  };

  const handleChangePrediction = (matchId: number, home: number, away: number) => {
    setPredictions(prev => ({ ...prev, [matchId]: { home, away } }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const payload = Object.entries(predictions).map(([matchId, score]) => ({
        matchId: Number(matchId),
        home: score.home,
        away: score.away,
      }));
      await savePredictions(payload);
      setMessage('Predictions saved successfully');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to save predictions');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Layout onLogout={handleLogout} username={username}>
      <div className="tabs">
        <button
          className={tab === 'matches' ? 'tab active' : 'tab'}
          onClick={() => setTab('matches')}
        >
          Matches & Predictions
        </button>
        <button
          className={tab === 'dashboard' ? 'tab active' : 'tab'}
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
      </div>

      {loading && <div className="info-banner">Loading, please wait...</div>}
      {message && <div className="success-banner">{message}</div>}
      {error && <div className="error-banner">{error}</div>}

      {tab === 'matches' && (
        <>
          <MatchesList
            matches={matches}
            predictions={predictions}
            onChangePrediction={handleChangePrediction}
            locked={locked}
          />
          <div className="actions-row">
            <button className="btn-primary" onClick={handleSave} disabled={locked || loading}>
              {locked ? 'Prediction window closed' : 'Save all predictions'}
            </button>
          </div>
        </>
      )}

      {tab === 'dashboard' && <Dashboard totalPoints={totalPoints} />}
    </Layout>
  );
};

export default App;