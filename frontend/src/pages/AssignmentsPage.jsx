import React, { useState, useEffect } from "react";
import AssignmentCard from "../components/AssignmentCard";
import { getAssignments } from "../services/api";
import "../styles/pages/_assignments.scss";

const FILTERS = ["all", "beginner", "intermediate", "advanced"];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAssignments()
      .then((res) => setAssignments(res.data.assignments))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load assignments."),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? assignments
      : assignments.filter((a) => a.difficulty === filter);

  return (
    <main className="assignments-page">
      <div className="container">
        <div className="assignments-page__hero">
          <h1 className="assignments-page__title">
            Practice <span>SQL</span> by Doing
          </h1>
          <p className="assignments-page__subtitle">
            Choose an assignment, write your query in the editor, and get
            intelligent hints when you're stuck.
          </p>
        </div>

        <div className="assignments-page__filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`assignments-page__filter-btn${filter === f ? " assignments-page__filter-btn--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="assignments-page__loading">
            <div className="spinner spinner--lg"></div>
            <p>Loading assignments...</p>
          </div>
        )}

        {error && (
          <div className="assignments-page__empty">
            <p style={{ color: "#ef4444" }}>❌ {error}</p>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "#64748b",
              }}
            >
              Make sure the backend server is running.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="assignments-page__empty">
            <p>No assignments found for this difficulty level.</p>
          </div>
        )}

        {!loading && !error && (
          <div className="assignments-page__grid">
            {filtered.map((assignment) => (
              <AssignmentCard key={assignment._id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
