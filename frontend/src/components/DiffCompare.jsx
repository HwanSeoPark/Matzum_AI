import { diffChars } from "diff";

/**
 * @param {object} props
 * @param {string} [props.original] 하위 호환: 좌측 기준 텍스트
 * @param {string} [props.corrected] 하위 호환: 우측 비교 텍스트
 * @param {string} [props.leftText] 명시 시 original 대신 사용
 * @param {string} [props.rightText] 명시 시 corrected 대신 사용
 * @param {string} [props.leftTitle]
 * @param {string} [props.rightTitle]
 * @param {boolean} [props.compact] 카드 내부 등 조밀한 레이아웃
 * @param {string} [props.className] 루트에 추가 클래스
 */
export default function DiffCompare({
  original,
  corrected,
  leftText,
  rightText,
  leftTitle = "원본",
  rightTitle = "교정본",
  compact = false,
  className = "",
}) {
  const left = leftText ?? original ?? "";
  const right = rightText ?? corrected ?? "";
  const parts = diffChars(left, right);

  const leftNodes = [];
  const rightNodes = [];
  let i = 0;
  for (const part of parts) {
    const key = `d-${i++}`;
    if (part.added) {
      rightNodes.push(
        <span key={key} className="diff-added">
          {part.value}
        </span>,
      );
    } else if (part.removed) {
      leftNodes.push(
        <span key={key} className="diff-removed">
          {part.value}
        </span>,
      );
    } else {
      leftNodes.push(
        <span key={`${key}-l`} className="diff-same">
          {part.value}
        </span>,
      );
      rightNodes.push(
        <span key={`${key}-r`} className="diff-same">
          {part.value}
        </span>,
      );
    }
  }

  const rootClass = [
    "diff-grid",
    compact ? "diff-grid--compact" : "",
    className.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <section className="diff-panel">
        <h2>{leftTitle}</h2>
        <div className="diff-body">{leftNodes}</div>
      </section>
      <section className="diff-panel">
        <h2>{rightTitle}</h2>
        <div className="diff-body">{rightNodes}</div>
      </section>
      <style>{`
        .diff-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          align-items: start;
        }
        @media (max-width: 800px) {
          .diff-grid {
            grid-template-columns: 1fr;
          }
        }
        .diff-panel {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid var(--border);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
        }
        .diff-panel h2 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .diff-body {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
          font-size: 0.9rem;
          line-height: 1.55;
          max-height: min(55vh, 480px);
          overflow: auto;
        }
        .diff-same {
          color: var(--text);
        }
        .diff-removed {
          color: var(--diff-removed);
          text-decoration: line-through;
          text-decoration-thickness: 1.5px;
        }
        .diff-added {
          background: var(--diff-added-bg);
          color: var(--text);
          border-radius: 2px;
        }
        .diff-grid--compact {
          gap: 0.5rem;
        }
        .diff-grid--compact .diff-panel {
          padding: 0.5rem 0.65rem;
          border-radius: 8px;
          box-shadow: none;
        }
        .diff-grid--compact .diff-panel h2 {
          font-size: 0.72rem;
          margin-bottom: 0.35rem;
        }
        .diff-grid--compact .diff-body {
          font-size: 0.8rem;
          line-height: 1.5;
          max-height: min(32vh, 220px);
        }
      `}</style>
    </div>
  );
}
