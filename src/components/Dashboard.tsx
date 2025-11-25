import React from 'react';

interface Props {
  totalPoints: number;
}

const Dashboard: React.FC<Props> = ({ totalPoints }) => {
  return (
    <div className="card">
      <h2 className="card-title">My Dashboard</h2>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total points</div>
          <div className="stat-value">{totalPoints}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;