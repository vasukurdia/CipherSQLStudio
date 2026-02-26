import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import ResultsTable from "../components/ResultsTable";
import {
  getAssignment,
  executeQuery,
  getHint,
  getUserAttempts,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/pages/_studio.scss";

export default function StudioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editorRef = useRef(null);

  const [assignment, setAssignment] = useState(null);
  const [sampleData, setSampleData] = useState({});
  const [query, setQuery] = useState("-- Write your SQL query here\nSELECT ");
  const [result, setResult] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [leftTab, setLeftTab] = useState("question"); // 'question' | 'schema' | 'data'
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [showAttempts, setShowAttempts] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    getAssignment(id)
      .then((res) => {
        setAssignment(res.data.assignment);
        setSampleData(res.data.sampleData);
      })
      .catch((err) =>
        setPageError(err.response?.data?.error || "Assignment not found."),
      )
      .finally(() => setPageLoading(false));

    if (user) {
      setAttemptsLoading(true);
      getUserAttempts(id)
        .then((res) => setAttempts(res.data.attempts))
        .catch(() => {})
        .finally(() => setAttemptsLoading(false));
    }
  }, [id, user]);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setQueryLoading(true);
    setResult(null);
    setQueryError(null);
    setHint(null);

    try {
      const res = await executeQuery({ query, assignmentId: id });
      setResult(res.data);

      if (user) {
        getUserAttempts(id)
          .then((res) => setAttempts(res.data.attempts))
          .catch(() => {});
      }
    } catch (err) {
      setQueryError(
        err.response?.data || {
          error: "Network error. Is the backend running?",
        },
      );
    } finally {
      setQueryLoading(false);
    }
  };

  const handleGetHint = async () => {
    setHintLoading(true);
    setHint(null);
    try {
      const res = await getHint({
        assignmentId: id,
        currentQuery: query,
        errorMessage: queryError?.error || null,
      });
      setHint(res.data.hint);
    } catch (err) {
      setHint("Could not generate a hint right now. Please try again.");
    } finally {
      setHintLoading(false);
    }
  };

  const handleClearEditor = () => {
    setQuery("-- Write your SQL query here\nSELECT ");
    setResult(null);
    setQueryError(null);
    setHint(null);
  };

  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleRunQuery();
    }
  };

  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          gap: "1rem",
          color: "#94a3b8",
        }}
      >
        <div className="spinner spinner--lg"></div>
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
          gap: "1rem",
          color: "#ef4444",
        }}
      >
        <p>❌ {pageError}</p>
        <button className="btn btn--secondary" onClick={() => navigate("/")}>
          ← Back to Assignments
        </button>
      </div>
    );
  }

  const difficultyIcon = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" };

  return (
    <div className="studio">
      <div className="studio__layout">
        {/* ===== LEFT PANEL ===== */}
        <aside className="studio__left">
          {/* Tabs */}
          <div className="studio__tabs">
            {["question", "schema", "data", "attempts"].map((tab) => (
              <button
                key={tab}
                className={`studio__tab${leftTab === tab ? " studio__tab--active" : ""}`}
                onClick={() => setLeftTab(tab)}
              >
                {tab === "question"
                  ? "📋 Question"
                  : tab === "schema"
                    ? "🗂 Schema"
                    : tab === "data"
                      ? "🔢 Sample Data"
                      : `🕒 Attempts${attempts.length > 0 ? ` (${attempts.length})` : ""}`}
              </button>
            ))}
          </div>

          {/* Question Tab */}
          {leftTab === "question" && (
            <div className="studio__panel">
              <div className="studio__panel-body">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span className={`badge badge--${assignment.difficulty}`}>
                    {difficultyIcon[assignment.difficulty]}{" "}
                    {assignment.difficulty}
                  </span>
                  {(assignment.tags || []).map((t) => (
                    <span key={t} className="assignment-card__tag">
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="studio__question-title">{assignment.title}</h2>
                <p className="studio__question-text">{assignment.question}</p>
                {assignment.requirements?.length > 0 && (
                  <>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "#6366f1",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Requirements
                    </p>
                    <ul className="studio__question-requirements">
                      {assignment.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Schema Tab */}
          {leftTab === "schema" && (
            <div className="studio__panel">
              <div className="studio__panel-body">
                {(assignment.tableSchemas || []).map((t) => (
                  <div key={t.tableName} className="studio__schema-table">
                    <div className="studio__schema-table-name">
                      📁 {t.tableName}
                    </div>
                    <div className="studio__schema-cols">
                      {t.columns.map((col) => (
                        <div key={col.name} className="studio__schema-col">
                          <span className="studio__schema-col-name">
                            {col.name}
                          </span>
                          <span className="studio__schema-col-type">
                            {col.type}
                          </span>
                          {col.description && (
                            <span className="studio__schema-col-desc">
                              — {col.description}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Data Tab */}
          {leftTab === "data" && (
            <div className="studio__panel">
              <div className="studio__panel-body">
                {Object.entries(sampleData).map(([table, data]) => (
                  <div key={table} style={{ marginBottom: "1.5rem" }}>
                    <div className="studio__sample-data-label">📁 {table}</div>
                    <div className="studio__sample-data-table-wrap">
                      <table className="studio__sample-data-table">
                        <thead>
                          <tr>
                            {data.columns.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.rows.map((row, i) => (
                            <tr key={i}>
                              {data.columns.map((col) => (
                                <td key={col}>
                                  {row[col] === null
                                    ? "NULL"
                                    : String(row[col])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p
                      style={{
                        fontSize: "0.7rem",
                        color: "#64748b",
                        marginTop: "0.25rem",
                      }}
                    >
                      Showing first 10 rows
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attempts Tab */}
          {leftTab === "attempts" && (
            <div className="studio__panel">
              <div className="studio__panel-body">
                {!user ? (
                  <div className="studio__attempts-login">
                    <span>🔒</span>
                    <p>Please login to save query attempts.</p>
                    <a href="/login" className="btn btn--primary btn--sm">
                      Login
                    </a>
                  </div>
                ) : attemptsLoading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "2rem",
                    }}
                  >
                    <div className="spinner"></div>
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="studio__attempts-empty">
                    <span>📭</span>
                    <p>
                      You haven’t run any query yet. Write a query above and
                      click Run Query!
                    </p>
                  </div>
                ) : (
                  <div className="studio__attempts-list">
                    {attempts.map((attempt, i) => (
                      <div key={i} className="studio__attempt-item">
                        <div className="studio__attempt-header">
                          <span className="studio__attempt-number">
                            #{attempts.length - i}
                          </span>
                          <span className="studio__attempt-time">
                            {new Date(attempt.executedAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                          <button
                            className="studio__attempt-load btn btn--ghost btn--sm"
                            onClick={() => {
                              setQuery(attempt.query);
                              setLeftTab("question");
                            }}
                          >
                            Load
                          </button>
                        </div>
                        <pre className="studio__attempt-query">
                          {attempt.query}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back button */}
          <div
            style={{ padding: "0.75rem 1rem", borderTop: "1px solid #334155" }}
          >
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigate("/")}
            >
              ← All Assignments
            </button>
          </div>
        </aside>

        {/* ===== RIGHT PANEL ===== */}
        <div className="studio__right">
          {/* EDITOR */}
          <div className="studio__editor-area">
            <div className="studio__editor-toolbar">
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontFamily: "monospace",
                }}
              >
                SQL Editor · Ctrl+Enter to run
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={handleClearEditor}
                >
                  Clear
                </button>
                <button
                  className={`btn btn--secondary btn--sm${hintLoading ? " btn--loading" : ""}`}
                  onClick={handleGetHint}
                  disabled={hintLoading}
                >
                  {!hintLoading && "💡 Get Hint"}
                </button>
                <button
                  className={`btn btn--primary btn--sm${queryLoading ? " btn--loading" : ""}`}
                  onClick={handleRunQuery}
                  disabled={queryLoading}
                >
                  {!queryLoading && "▶ Run Query"}
                </button>
              </div>
            </div>

            <div
              className="studio__editor-wrap"
              onKeyDown={handleEditorKeyDown}
            >
              <Editor
                height="250px"
                defaultLanguage="sql"
                theme="vs-dark"
                value={query}
                onChange={(val) => setQuery(val || "")}
                onMount={(editor) => {
                  editorRef.current = editor;
                  setTimeout(() => editor.layout(), 100);
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  suggest: { showKeywords: true },
                }}
              />
            </div>
          </div>

          {/* HINT PANEL */}
          {hint && (
            <div className="studio__hint">
              <div className="studio__hint-header">
                <span className="studio__hint-title">💡 Hint</span>
                <button
                  className="studio__hint-close"
                  onClick={() => setHint(null)}
                >
                  ×
                </button>
              </div>
              <p className="studio__hint-text">{hint}</p>
            </div>
          )}

          {/* RESULTS */}
          <div className="studio__results">
            <div className="studio__results-header">
              <span className="studio__panel-title">Results</span>
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                {result && (
                  <>
                    <span className="studio__results-count">
                      ✓ {result.rowCount} row{result.rowCount !== 1 ? "s" : ""}
                    </span>
                    <span className="studio__results-meta">
                      {result.duration}ms
                    </span>
                  </>
                )}
                {queryError && (
                  <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
                    Error
                  </span>
                )}
              </div>
            </div>
            <div className="studio__results-body">
              <ResultsTable
                result={result}
                error={queryError}
                loading={queryLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
