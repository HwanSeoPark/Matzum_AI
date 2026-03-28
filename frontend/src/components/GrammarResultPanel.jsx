import { useState } from "react";
import { postRecommendStyle } from "../api/correction.js";
import DiffCompare from "./DiffCompare.jsx";
import StyleDiffHighlight from "./StyleDiffHighlight.jsx";

export default function GrammarResultPanel({ original, corrected }) {
  const [styleLoading, setStyleLoading] = useState(false);
  const [styleError, setStyleError] = useState(null);
  const [recommended, setRecommended] = useState(null);

  async function onRecommend() {
    setStyleError(null);
    setStyleLoading(true);
    try {
      const data = await postRecommendStyle(corrected);
      setRecommended(data.recommended ?? []);
    } catch (e) {
      setRecommended(null);
      setStyleError(e.message || String(e));
    } finally {
      setStyleLoading(false);
    }
  }

  const [first, second] = recommended ?? [];

  return (
    <div className="grammar-result">
      <DiffCompare original={original} corrected={corrected} />

      <div className="style-block">
        <button
          type="button"
          className="btn-style"
          onClick={onRecommend}
          disabled={styleLoading}
        >
          자연스러운 문장으로 다듬기 ✨
        </button>

        {styleLoading && (
          <div className="style-loading" role="status">
            <span className="mini-spinner" />
            <span>윤문 추천 생성 중…</span>
          </div>
        )}

        {styleError && <p className="style-err">{styleError}</p>}

        {recommended && !styleLoading && (
          <div className="rec-cards">
            <article className="rec-card">
              <h3>추천 1</h3>
              {first?.trim() ? (
                <StyleDiffHighlight baseline={corrected} recommended={first} />
              ) : (
                <p className="rec-empty">—</p>
              )}
            </article>
            <article className="rec-card">
              <h3>추천 2</h3>
              {second?.trim() ? (
                <StyleDiffHighlight baseline={corrected} recommended={second} />
              ) : (
                <p className="rec-empty">—</p>
              )}
            </article>
          </div>
        )}
      </div>

      <style>{`
        .grammar-result {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .style-block {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
        }
        .btn-style {
          padding: 0.55rem 1.1rem;
          border-radius: 10px;
          border: none;
          background: var(--style-accent);
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .btn-style:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .style-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.85rem;
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .mini-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-top-color: var(--style-accent);
          border-radius: 50%;
          animation: gr-spin 0.75s linear infinite;
        }
        @keyframes gr-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .style-err {
          margin: 0.75rem 0 0;
          color: var(--danger);
          font-size: 0.88rem;
        }
        .rec-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        @media (max-width: 700px) {
          .rec-cards {
            grid-template-columns: 1fr;
          }
        }
        .rec-card {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.85rem 1rem;
        }
        .rec-card h3 {
          margin: 0 0 0.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .rec-empty {
          margin: 0;
          font-size: 0.88rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
