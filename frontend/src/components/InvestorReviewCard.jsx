// components/InvestorReviewCard.jsx
// Displays one AI investor's review: score, roast, tip, funding and equity.

import { ShieldAlert, Laugh, Rocket, Lightbulb } from "lucide-react";

// Look up the icon and color for each investor personality.
const INVESTOR_META = {
  "Strict Investor": { icon: ShieldAlert, className: "icon-strict" },
  "Funny Investor": { icon: Laugh, className: "icon-funny" },
  "Dreamer Investor": { icon: Rocket, className: "icon-dreamer" },
};

function formatMoney(amount) {
  return "Rs. " + Number(amount).toLocaleString();
}

export default function InvestorReviewCard({ review }) {
  const meta =
    INVESTOR_META[review.investorName] || INVESTOR_META["Dreamer Investor"];
  const Icon = meta.icon;

  return (
    <div className="review-card">
      <div className="review-head">
        <div className="review-investor">
          <span className={"review-avatar " + meta.className}>
            <Icon size={20} />
          </span>
          <div>
            <strong>{review.investorName}</strong>
            <div className="small muted">AI Investor</div>
          </div>
        </div>
        <span className="score-pill">{review.score}/10</span>
      </div>

      <p className="review-roast">{review.roast}</p>

      <div className="review-tip">
        <Lightbulb size={18} className="muted" />
        <span>{review.improvementTip}</span>
      </div>

      <div className="offer-row">
        <div className="offer-item">
          <strong>{formatMoney(review.fundingAmount)}</strong>
          <span>Funding offer</span>
        </div>
        <div className="offer-item">
          <strong>{review.equityPercentage}%</strong>
          <span>Equity</span>
        </div>
      </div>
    </div>
  );
}
