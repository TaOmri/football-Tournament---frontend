import React from 'react';
import { Match } from '../types';

interface Props {
  matches: Match[];
  predictions: Record<number, { home: number; away: number }>;
  onChangePrediction: (matchId: number, home: number, away: number) => void;
  locked: boolean;
}

const MatchesList: React.FC<Props> = ({
  matches,
  predictions,
  onChangePrediction,
  locked,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">Group & Knockout Matches</h2>
      <p className="card-subtitle">
        Enter your full-time score prediction for every match. Exact score = 7 pts, correct outcome = 3 pts.
      </p>
      <div className="matches-grid">
        {matches.map(m => {
          const pred = predictions[m.id] || { home: 0, away: 0 };
          const kickoff = new Date(m.kickoff_at);
          const dateStr = kickoff.toLocaleString();
          const isFinished = m.result_home !== null && m.result_away !== null;
          return (
            <div key={m.id} className="match-card">
              <div className="match-header">
                <span className="pill pill-stage">{m.stage}</span>
                <span className="match-date">{dateStr}</span>
              </div>
              <div className="teams-row">
                <span className="team-name">{m.home_team_name}</span>
                <span className="vs">vs</span>
                <span className="team-name">{m.away_team_name}</span>
              </div>
              <div className="prediction-row">
                <input
                  type="number"
                  min={0}
                  className="score-input"
                  value={pred.home}
                  disabled={locked}
                  onChange={e =>
                    onChangePrediction(m.id, Number(e.target.value || 0), pred.away)
                  }
                  aria-label={`Home score prediction for match ${m.home_team_name} vs ${m.away_team_name}`}
                />
                <span>:</span>
                <input
                  type="number"
                  min={0}
                  className="score-input"
                  value={pred.away}
                  disabled={locked}
                  onChange={e =>
                    onChangePrediction(m.id, pred.home, Number(e.target.value || 0))
                  }
                  aria-label={`Away score prediction for match ${m.home_team_name} vs ${m.away_team_name}`}
                />
              </div>
              {isFinished && (
                <div className="result-row">
                  Final result: {m.result_home} : {m.result_away}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesList;