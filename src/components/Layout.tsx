import React from 'react';

interface Props {
  children: React.ReactNode;
  onLogout: () => void;
  username: string;
}

const Layout: React.FC<Props> = ({ children, onLogout, username }) => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">⚽ Tournament Bets</div>
        <div className="header-right">
          <span className="username">Hi, {username}</span>
          <button className="btn-outline" onClick={onLogout}>Logout</button>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        Built with React + TypeScript
      </footer>
    </div>
  );
};

export default Layout;