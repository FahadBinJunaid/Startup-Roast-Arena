// pages/Dashboard.jsx
// Private overview page: shows the user's own ideas and quick stats.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Trophy, Layers, ThumbsUp } from "lucide-react";
import api, { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import IdeaCard from "../components/IdeaCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

export default function Dashboard() {
  const { user } = useAuth();

  const [myIdeas, setMyIdeas] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [ideasResponse, leaderboardResponse] = await Promise.all([
          api.get("/ideas"),
          api.get("/leaderboard"),
        ]);

        const mine = ideasResponse.data.ideas.filter(function (idea) {
          return idea.owner && idea.owner._id === user.id;
        });

        const myBoardRows = leaderboardResponse.data.leaderboard.filter(
          function (row) {
            return row.owner && row.owner._id === user.id;
          }
        );

        setMyIdeas(mine);
        setMyRows(myBoardRows);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user.id]);

  if (loading) {
    return (
      <div className="container page">
        <Loader message="Loading your dashboard..." />
      </div>
    );
  }

  // Add up community votes and find the best final score.
  let totalVotes = 0;
  let bestScore = 0;

  for (const row of myRows) {
    totalVotes = totalVotes + row.voteCount;

    if (row.finalScore > bestScore) {
      bestScore = row.finalScore;
    }
  }

  return (
    <div className="container page">
      <div className="row-between section-head">
        <div>
          <h1>Welcome, {user.name}</h1>
          <p className="muted">Track your pitches and community performance.</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          <PlusCircle size={18} /> New idea
        </Link>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        <div className="stat">
          <Layers size={20} className="muted" />
          <div className="stat-value">{myIdeas.length}</div>
          <div className="stat-label">Ideas submitted</div>
        </div>
        <div className="stat">
          <ThumbsUp size={20} className="muted" />
          <div className="stat-value">{totalVotes}</div>
          <div className="stat-label">Community votes received</div>
        </div>
        <div className="stat">
          <Trophy size={20} className="muted" />
          <div className="stat-value">{bestScore.toFixed(2)}</div>
          <div className="stat-label">Best leaderboard score</div>
        </div>
      </div>

      <div className="row-between section-head">
        <h2>Your recent ideas</h2>
        <Link to="/my-ideas" className="btn btn-secondary btn-sm">
          Manage all
        </Link>
      </div>

      {myIdeas.length === 0 && (
        <EmptyState
          title="You have not submitted any ideas yet"
          message="Submit your first startup idea and get roasted by three AI investors."
          action={
            <Link to="/submit" className="btn btn-primary">
              Submit an idea
            </Link>
          }
        />
      )}

      {myIdeas.length > 0 && (
        <div className="grid grid-3">
          {myIdeas.slice(0, 3).map((idea) => (
            <IdeaCard idea={idea} key={idea.id} />
          ))}
        </div>
      )}
    </div>
  );
}
