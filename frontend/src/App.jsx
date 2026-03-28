import { useState } from "react";
import { postCheckGrammar, postCheckGrammarText } from "./api/correction.js";
import GrammarResultPanel from "./components/GrammarResultPanel.jsx";

export default function App() {
  const [mode, setMode] = useState("file");
  const [file, setFile] = useState(null);
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [resultKey, setResultKey] = useState(0);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (mode === "file") {
      if (!file) {
        setError("파일을 선택하세요.");
        return;
      }
    } else {
      const t = pasteText.trim();
      if (!t) {
        setError("텍스트를 입력하세요.");
        return;
      }
    }

    setLoading(true);
    try {
      const data =
        mode === "file"
          ? await postCheckGrammar(file)
          : await postCheckGrammarText(pasteText);
      setResult(data);
      setResultKey((k) => k + 1);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    mode === "file" ? Boolean(file) : Boolean(pasteText.trim());

  return (
    <div className="app">
      <header className="header">
        <h1>맞춤아이 - AI 맞춤법·띄어쓰기 교정</h1>
      </header>

      <div className="mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "file"}
          className={mode === "file" ? "active" : ""}
          onClick={() => {
            setMode("file");
            setError(null);
          }}
          disabled={loading}
        >
          파일 업로드
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "paste"}
          className={mode === "paste" ? "active" : ""}
          onClick={() => {
            setMode("paste");
            setError(null);
          }}
          disabled={loading}
        >
          직접 입력
        </button>
      </div>

      <form className="input-form" onSubmit={onSubmit}>
        {mode === "file" ? (
          <label className="file-label">
            <span>.txt 파일 선택</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={loading}
            />
          </label>
        ) : (
          <label className="paste-label">
            <span>원문 입력</span>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              disabled={loading}
              rows={8}
              placeholder="여기에 문장을 붙여 넣거나 입력하세요."
            />
          </label>
        )}
        <button type="submit" disabled={loading || !canSubmit}>
          맞춤법 교정
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="spinner" />
          <p>맞춤법 교정 중…</p>
        </div>
      )}

      {result && !loading && (
        <GrammarResultPanel
          key={resultKey}
          original={result.original}
          corrected={result.corrected}
        />
      )}

      <style>{`
        .app {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .header h1 {
          margin: 0 0 0.25rem;
          font-size: 1.5rem;
          color: var(--text);
        }
        .sub {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .mode-tabs {
          display: flex;
          gap: 0.35rem;
          margin: 1.25rem 0 0.75rem;
        }
        .mode-tabs button {
          padding: 0.45rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .mode-tabs button.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }
        .mode-tabs button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .input-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
          margin: 0 0 1.25rem;
        }
        .file-label,
        .paste-label {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          width: 100%;
        }
        .file-label input {
          color: var(--text);
        }
        .paste-label textarea {
          width: 100%;
          resize: vertical;
          min-height: 140px;
          padding: 0.65rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text);
          font-size: 0.9rem;
          line-height: 1.5;
          font-family: inherit;
        }
        .paste-label textarea::placeholder {
          color: var(--text-muted);
        }
        .paste-label textarea:focus {
          outline: 2px solid var(--accent);
          outline-offset: 1px;
        }
        button[type="submit"] {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: none;
          background: var(--accent);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
        }
        button[type="submit"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .error {
          color: var(--danger);
        }
        .loading-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 2rem;
          background: var(--bg-card);
          border-radius: 12px;
          margin-bottom: 1rem;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
