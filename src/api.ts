import axios from 'axios';
import { Match, Prediction } from './types';

import { API_URL } from "./config";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function register(username: string, password: string) {
  const res = await api.post('/auth/register', { username, password });
  return res.data;
}

export async function login(username: string, password: string) {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await api.get('/matches');
  return res.data;
}

export async function fetchMyPredictions() {
  const res = await api.get('/predictions/mine');
  return res.data as { match_id: number; predicted_home: number; predicted_away: number }[];
}

export async function savePredictions(predictions: Prediction[]) {
  const res = await api.post('/predictions/bulk', { predictions });
  return res.data;
}

export async function fetchPoints() {
  const res = await api.get('/predictions/points');
  return res.data as { totalPoints: number; perMatch: { matchId: number; points: number }[] };
}

export async function fetchLeaderboard() {
  const res = await api.get("/users/leaderboard");
  return res.data;
}

export async function fetchGroupStandings() {
  const res = await api.get("/groups/standings");
  return res.data;
}
