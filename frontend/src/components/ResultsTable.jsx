import React from "react";

export default function ResultsTable({ result, error, loading }) {
  if (loading) {
    return (
      <div className="studio__results-loading">
        <div className="spinner"></div>
        <span>Executing query...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="studio__results-error">
        <strong>⚠ Query Error</strong>
        <pre>
          {error.error || error}
          {error.detail ? `\nDetail: ${error.detail}` : ""}
          {error.hint ? `\nHint: ${error.hint}` : ""}
        </pre>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="studio__results-empty">
        <span style={{ fontSize: "2rem" }}>▶</span>
        <span>
          Write a query above and click <strong>Run Query</strong> to see
          results here.
        </span>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="studio__results-empty">
        <span style={{ fontSize: "2rem" }}>📭</span>
        <span>Query executed successfully but returned 0 rows.</span>
      </div>
    );
  }

  return (
    <div className="studio__results-table-wrap">
      <table className="studio__results-table">
        <thead>
          <tr>
            {result.columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i}>
              {result.columns.map((col) => (
                <td key={col}>
                  {row[col] === null ? (
                    <em style={{ color: "#475569" }}>NULL</em>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
