// pages/Landing.jsx
// Public home page: explains the product and shows the latest pitches.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Laugh, Rocket, ArrowRight, Sparkles } from "lucide-react";
import api from "../services/api";
import IdeaCard from "../components/IdeaCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const INVESTORS = [
  {
    name: "Strict Investor",
    icon: ShieldAlert,
    className: "icon-strict",
    text: "Grills your business model with hard questions about revenue, costs, market size and competition.",
  },
  {
    name: "Funny Investor",
    icon: Laugh,
    className: "icon-funny",
    text: "Roasts your idea to your chosen spice level — while still slipping in one genuinely useful observation.",
  },
  {
    name: "Dreamer Investor",
    icon: Rocket,
    className: "icon-dreamer",
    text: "Sees your idea's future potential and maps out how it could grow into a much bigger business.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIdeas() {
      try {
        const response = await api.get("/ideas");
        setIdeas(response.data.ideas.slice(0, 3));
      } catch {
        // The landing page should still work even if ideas cannot load.
        setIdeas([]);
      } finally {
        setLoading(false);
      }
    }

    loadIdeas();
  }, []);

  return (
    <div>
      <section className="container hero">
        <span className="badge badge-neutral">
          <Sparkles size={14} /> AI-powered startup feedback
        </span>
        <h1 className="hero-title">
          Pitch your startup. <span className="gradient-text">Get roasted</span>{" "}
          by three AI investors.
        </h1>
        <p className="hero-sub">
          Submit your idea, choose your roast level, and face a Strict, Funny
          and Dreamer investor. Collect AI scores and funding offers, then let
          the community vote you up the leaderboard.
        </p>

        <div className="hero-actions">
          {user ? (
            <Link to="/submit" className="btn btn-primary">
              Submit a startup idea <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary">
              Get started free <ArrowRight size={18} />
            </Link>
          )}
          <Link to="/leaderboard" className="btn btn-secondary">
            View leaderboard
          </Link>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>Meet your three investors</h2>
          <p>Every idea is reviewed by all three personalities.</p>
        </div>

        <div className="grid grid-3">
          {INVESTORS.map((investor) => {
            const Icon = investor.icon;

            return (
              <div className="feature-card" key={investor.name}>
                <span className={"feature-icon " + investor.className}>
                  <Icon size={22} />
                </span>
                <h3>{investor.name}</h3>
                <p className="muted">{investor.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>How it works</h2>
        </div>

        <div className="grid grid-3">
          <div className="feature-card">
            <h3>1. Describe your idea</h3>
            <p className="muted">
              Explain the problem, your solution and your target customer, then
              pick a roast level.
            </p>
          </div>
          <div className="feature-card">
            <h3>2. Face the investors</h3>
            <p className="muted">
              Get three scores out of 10, roasts, improvement tips and fictional
              funding offers.
            </p>
          </div>
          <div className="feature-card">
            <h3>3. Win the crowd</h3>
            <p className="muted">
              Community votes and AI scores combine on the leaderboard. Re-pitch
              to improve your score.
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="row-between section-head">
          <div>
            <h2>Latest pitches</h2>
            <p>Fresh ideas from the community.</p>
          </div>
          <Link to="/leaderboard" className="btn btn-secondary btn-sm">
            See all
          </Link>
        </div>

        {loading && <Loader message="Loading pitches..." />}

        {!loading && ideas.length === 0 && (
          <div className="empty">
            <h3>No ideas yet</h3>
            <p>Be the first to submit a startup idea.</p>
            <Link to={user ? "/submit" : "/register"} className="btn btn-primary">
              Submit an idea
            </Link>
          </div>
        )}

        {!loading && ideas.length > 0 && (
          <div className="grid grid-3">
            {ideas.map((idea) => (
              <IdeaCard idea={idea} key={idea.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
