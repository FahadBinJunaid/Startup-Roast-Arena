// pages/IdeaDetails.jsx
// Shows one startup idea: its versions, the AI investor reviews, community
// voting, and (for the owner) the re-pitch form.

import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  ThumbsUp,
  CheckCircle2,
} from "lucide-react";
import api, { getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import RoastBadge from "../components/RoastBadge";
import InvestorReviewCard from "../components/InvestorReviewCard";

// Read the owner id whether owner is populated (object) or a plain id (string).
function getOwnerId(idea) {
  if (!idea || !idea.owner) {
    return null;
  }

  if (typeof idea.owner === "string") {
    return idea.owner;
  }

  return idea.owner._id;
}

function getOwnerName(idea) {
  if (idea && idea.owner && idea.owner.name) {
    return idea.owner.name;
  }

  return "Unknown";
}

// Average AI score for a specific version (or null if no reviews yet).
function averageScore(reviews, versionNumber) {
  const list = reviews.filter(function (review) {
    return review.versionNumber === versionNumber;
  });

  if (list.length === 0) {
    return null;
  }

  let total = 0;

  for (const review of list) {
    total = total + review.score;
  }

  return total / list.length;
}

export default function IdeaDetails() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  const [idea, setIdea] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [voteInfo, setVoteInfo] = useState({
    voteCount: 0,
    hasVoted: false,
    isOwner: false,
  });

  const [selectedVersion, setSelectedVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // If the Submit page sent us an AI error, show it right away.
  const [actionError, setActionError] = useState(
    location.state && location.state.aiError ? location.state.aiError : ""
  );

  const [voting, setVoting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [repitchOpen, setRepitchOpen] = useState(false);
  const [repitchSubmitting, setRepitchSubmitting] = useState(false);
  const [autoEvaluateRepitch, setAutoEvaluateRepitch] = useState(true);
  const [repitchForm, setRepitchForm] = useState({
    problem: "",
    solution: "",
    targetCustomer: "",
    roastLevel: "Medium",
  });

  useEffect(() => {
    async function loadAll() {
      try {
        const [ideaResponse, reviewsResponse, votesResponse] =
          await Promise.all([
            api.get("/ideas/" + id),
            api.get("/ideas/" + id + "/reviews"),
            api.get("/ideas/" + id + "/votes"),
          ]);

        setIdea(ideaResponse.data.idea);
        setReviews(reviewsResponse.data.reviews);
        setVoteInfo(votesResponse.data);
        setSelectedVersion(ideaResponse.data.idea.currentVersion);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id]);

  async function refreshIdea() {
    const response = await api.get("/ideas/" + id);
    setIdea(response.data.idea);
    return response.data.idea;
  }

  async function refreshReviews() {
    const response = await api.get("/ideas/" + id + "/reviews");
    setReviews(response.data.reviews);
  }

  async function handleVote() {
    setVoting(true);
    setActionError("");
    setNotice("");

    try {
      await api.post("/ideas/" + id + "/vote");
      const response = await api.get("/ideas/" + id + "/votes");
      setVoteInfo(response.data);
      setNotice("Your vote has been recorded.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setVoting(false);
    }
  }

  async function handleEvaluate() {
    setEvaluating(true);
    setActionError("");
    setNotice("");

    try {
      await api.post("/ideas/" + id + "/evaluate");
      await refreshReviews();
      setNotice("New AI investor reviews generated.");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setEvaluating(false);
    }
  }

  function openRepitch() {
    // Pre-fill the form with the current version's content.
    const current = idea.versions[idea.versions.length - 1];

    setRepitchForm({
      problem: current.problem,
      solution: current.solution,
      targetCustomer: current.targetCustomer,
      roastLevel: current.roastLevel,
    });

    setRepitchOpen(true);
    setNotice("");
    setActionError("");
  }

  function handleRepitchChange(event) {
    const { name, value } = event.target;
    setRepitchForm({ ...repitchForm, [name]: value });
  }

  async function handleRepitchSubmit(event) {
    event.preventDefault();
    setRepitchSubmitting(true);
    setActionError("");
    setNotice("");

    try {
      await api.put("/ideas/" + id + "/repitch", repitchForm);

      // Re-fetch so the owner object (name) is populated again.
      const updatedIdea = await refreshIdea();
      setSelectedVersion(updatedIdea.currentVersion);
      setRepitchOpen(false);

      if (autoEvaluateRepitch) {
        try {
          await api.post("/ideas/" + id + "/evaluate");
        } catch (err) {
          setActionError(
            "New version saved, but AI reviews failed: " + getErrorMessage(err)
          );
        }
      }

      await refreshReviews();
      setNotice("Re-pitch saved as version " + updatedIdea.currentVersion + ".");
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setRepitchSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container page">
        <Loader message="Loading idea..." />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="container page">
        <ErrorMessage message={error || "Idea not found"} />
        <div className="spacer" />
        <Link to="/leaderboard" className="btn btn-secondary">
          <ArrowLeft size={18} /> Back to leaderboard
        </Link>
      </div>
    );
  }

  const isOwner = user && getOwnerId(idea) === user.id;

  // The version the user is currently viewing.
  let versionToShow = idea.versions[0];

  for (const version of idea.versions) {
    if (version.versionNumber === selectedVersion) {
      versionToShow = version;
    }
  }

  const reviewsForVersion = reviews.filter(function (review) {
    return review.versionNumber === selectedVersion;
  });

  const hasReviewsForCurrentVersion = reviewsForVersion.length > 0;

  return (
    <div className="container page">
      <Link to="/leaderboard" className="btn btn-ghost btn-sm">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="spacer" />

      <div className="card">
        <div className="row-between">
          <div className="row">
            <RoastBadge level={versionToShow.roastLevel} />
            <span className="badge badge-neutral">
              Version {versionToShow.versionNumber}
            </span>
          </div>
          <span className="small muted">
            by {getOwnerName(idea)} ·{" "}
            {new Date(idea.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="spacer" />

        <h1 style={{ fontSize: "1.7rem" }}>{versionToShow.problem}</h1>

        <div className="grid grid-2" style={{ marginTop: 18 }}>
          <div>
            <h3>Solution</h3>
            <p className="muted">{versionToShow.solution}</p>
          </div>
          <div>
            <h3>Target customer</h3>
            <p className="muted">{versionToShow.targetCustomer}</p>
          </div>
        </div>
      </div>

      <div className="spacer" />

      <ErrorMessage message={actionError} />

      {notice && (
        <div className="alert alert-success row" style={{ gap: 8 }}>
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      <div className="spacer" />

      {/* Owner controls */}
      {isOwner && (
        <div className="card">
          <div className="row-between">
            <div>
              <h3>Founder controls</h3>
              <p className="muted small" style={{ margin: 0 }}>
                You own this idea. Generate reviews or submit an improved version.
              </p>
            </div>
            <div className="row">
              <button
                className="btn btn-primary"
                onClick={handleEvaluate}
                disabled={evaluating}
              >
                <Sparkles size={18} />
                {evaluating
                  ? "Asking the investors..."
                  : hasReviewsForCurrentVersion
                    ? "Re-run AI reviews"
                    : "Get AI investor reviews"}
              </button>
              <button className="btn btn-secondary" onClick={openRepitch}>
                <RotateCcw size={18} /> Re-pitch
              </button>
            </div>
          </div>

          {repitchOpen && (
            <form onSubmit={handleRepitchSubmit} style={{ marginTop: 20 }}>
              <div className="field">
                <label className="label">Problem</label>
                <textarea
                  className="textarea"
                  name="problem"
                  value={repitchForm.problem}
                  onChange={handleRepitchChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Solution</label>
                <textarea
                  className="textarea"
                  name="solution"
                  value={repitchForm.solution}
                  onChange={handleRepitchChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Target customer</label>
                <input
                  className="input"
                  name="targetCustomer"
                  value={repitchForm.targetCustomer}
                  onChange={handleRepitchChange}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Roast level</label>
                <select
                  className="select"
                  name="roastLevel"
                  value={repitchForm.roastLevel}
                  onChange={handleRepitchChange}
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Spicy">Spicy</option>
                </select>
              </div>
              <div className="field">
                <label className="row" style={{ gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={autoEvaluateRepitch}
                    onChange={() => setAutoEvaluateRepitch(!autoEvaluateRepitch)}
                  />
                  <span>Generate new AI reviews for this version</span>
                </label>
              </div>
              <div className="row">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={repitchSubmitting}
                >
                  {repitchSubmitting ? "Saving..." : "Submit re-pitch"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRepitchOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Voting */}
      {!isOwner && (
        <div className="card">
          <div className="row-between">
            <div>
              <h3>Community vote</h3>
              <p className="muted" style={{ margin: 0 }}>
                {voteInfo.voteCount}{" "}
                {voteInfo.voteCount === 1 ? "person has" : "people have"} voted
                for this idea.
              </p>
            </div>

            {!user && (
              <Link to="/login" className="btn btn-primary">
                Log in to vote
              </Link>
            )}

            {user && (
              <button
                className="btn btn-primary"
                onClick={handleVote}
                disabled={voting || voteInfo.hasVoted}
              >
                <ThumbsUp size={18} />
                {voteInfo.hasVoted
                  ? "You voted"
                  : voting
                    ? "Voting..."
                    : "Vote for this idea"}
              </button>
            )}
          </div>
        </div>
      )}

      {isOwner && (
        <div className="alert alert-info">
          You cannot vote for your own idea. Community voting is for other
          founders.
        </div>
      )}

      <div className="spacer" />

      {/* Version comparison */}
      {idea.versions.length > 1 && (
        <div className="card">
          <h3>Version history</h3>
          <p className="muted small">
            Compare your original pitch with your re-pitches. Select a version to
            read its reviews.
          </p>

          <div className="row" style={{ marginBottom: 12 }}>
            {idea.versions.map((version) => (
              <button
                key={version.versionNumber}
                className={
                  "version-pill" +
                  (version.versionNumber === selectedVersion ? " active" : "")
                }
                onClick={() => setSelectedVersion(version.versionNumber)}
              >
                Version {version.versionNumber}
              </button>
            ))}
          </div>

          <div>
            {idea.versions.map((version) => {
              const avg = averageScore(reviews, version.versionNumber);

              return (
                <div className="compare-row" key={version.versionNumber}>
                  <span>
                    <strong>Version {version.versionNumber}</strong>{" "}
                    <span className="small muted">
                      {version.problem.slice(0, 60)}
                      {version.problem.length > 60 ? "..." : ""}
                    </span>
                  </span>
                  <span className="score-strong">
                    {avg === null ? "No reviews" : avg.toFixed(2) + " / 10"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="spacer" />

      {/* Reviews */}
      <div className="section-head">
        <h2>Investor reviews for version {selectedVersion}</h2>
        <p>The Strict, Funny and Dreamer investors each scored this pitch.</p>
      </div>

      {reviewsForVersion.length === 0 && (
        <EmptyState
          title="No AI reviews yet for this version"
          message={
            isOwner
              ? "Use the founder controls above to ask the AI investors."
              : "The founder has not generated reviews for this version yet."
          }
        />
      )}

      {reviewsForVersion.length > 0 && (
        <div className="grid grid-3">
          {reviewsForVersion.map((review) => (
            <InvestorReviewCard review={review} key={review._id} />
          ))}
        </div>
      )}
    </div>
  );
}
