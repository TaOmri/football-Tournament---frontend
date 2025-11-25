export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  kickoff_at: string;
  stage: string;
  result_home: number | null;
  result_away: number | null;
}

export interface Prediction {
  matchId: number;
  home: number;
  away: number;
}