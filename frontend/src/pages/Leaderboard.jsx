// pages/Leaderboard.jsx
// Public ranking table. It combines each idea's AI score with community votes
// using the backend formula: finalScore = 0.7 * aiScore + 0.3 * voteScore.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import api, { getErrorMessage } from "../services/api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import RoastBadge from "../components/RoastBadge";

// Returns the CSS class for the top three ranks.
function rankClass(rank) {
  if (rank === 1) {
    return "rank-badge rank-1";
  }
  if (rank === 2) {
    return "rank-badge rank-2";
  }
  if (rank === 3) {
    return "rank-badge rank-3";
  }
  return "rank-badge";
}

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/leaderboard");
        setRows(response.data.leaderboard);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="container page">
      <div className="section-head">
        <h1>
          <Trophy size={26} style={{ verticalAlign: "-4px" }} /> Leaderboard
        </h1>
        <p>
          Ranked by final score: 70% AI investor score + 30% community votes.
          Only the current version of each idea counts.
        </p>
      </div>

      <ErrorMessage message={error} />

      {loading && <Loader message="Loading leaderboard..." />}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="The leaderboard is empty"
          message="No ideas have been submitted yet. Be the first to enter the arena."
          action={
            <Link to="/submit" className="btn btn-primary">
              Submit an idea
            </Link>
          }
        />
      )}

      {!loading && rows.length > 0 && (
        <div className="table-wrap">
          <table className="leaderboard">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Idea</th>
                <th>Founder</th>
                <th>Roast</th>
                <th>AI score</th>
                <th>Votes</th>
                <th>Final score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ideaId}>
                  <td>
                    <span className={rankClass(row.rank)}>{row.rank}</span>
                  </td>
                  <td>
                    <Link to={"/ideas/" + row.ideaId}>
                      <strong>{row.problem}</strong>
                    </Link>
                    <div className="small muted">
                      Version {row.currentVersion} · {row.reviewCount} review
                      {row.reviewCount === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td>{row.owner && row.owner.name ? row.owner.name : "Unknown"}</td>
                  <td>
                    <RoastBadge level={row.roastLevel} />
                  </td>
                  <td>{row.aiScore.toFixed(2)}</td>
                  <td>{row.voteCount}</td>
                  <td>
                    <span className="score-strong">
                      {row.finalScore.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
