import { diffChars } from "diff";

/** 교정본 대비 추천문만 표시. 바뀐(추가) 구간만 강조. */
export default function StyleDiffHighlight({ baseline, recommended }) {
  const parts = diffChars(baseline ?? "", recommended ?? "");
  const nodes = [];
  let i = 0;
  for (const part of parts) {
    if (part.removed) continue;
    const key = `sd-${i++}`;
    if (part.added) {
      nodes.push(
        <span key={key} className="style-diff-added">
          {part.value}
        </span>,
      );
    } else {
      nodes.push(
        <span key={key} className="style-diff-same">
          {part.value}
        </span>,
      );
    }
  }

  return (
    <div className="style-diff-highlight">
      <div className="style-diff-body">{nodes}</div>
      <style>{`
        .style-diff-highlight {
          margin: 0;
        }
        .style-diff-body {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.88rem;
          line-height: 1.55;
          color: var(--text);
        }
        .style-diff-same {
          color: var(--text);
        }
        .style-diff-added {
          background: var(--diff-added-bg);
          color: var(--text);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
