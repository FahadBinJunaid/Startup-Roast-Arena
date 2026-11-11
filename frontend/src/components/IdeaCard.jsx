// components/IdeaCard.jsx
// A summary card for one startup idea, linking to its details page.

import { Link } from "react-router-dom";
import { User } from "lucide-react";
import RoastBadge from "./RoastBadge";

export default function IdeaCard({ idea }) {
  const ownerName = idea.owner && idea.owner.name ? idea.owner.name : "Unknown";

  return (
    <Link
      to={"/ideas/" + idea.id}
      className="card card-hover idea-card"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="idea-card-head">
        <RoastBadge level={idea.roastLevel} />
        <span className="small muted">v{idea.currentVersion}</span>
      </div>

      <h3>{idea.problem}</h3>
      <p className="idea-snippet">{idea.solution}</p>

      <div className="idea-meta">
        <span className="row" style={{ gap: 6 }}>
          <User size={14} />
          {ownerName}
        </span>
      </div>
    </Link>
  );
}
