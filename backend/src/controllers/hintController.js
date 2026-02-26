const { GoogleGenAI } = require('@google/genai');
const Assignment = require('../models/Assignment');

exports.getHint = async (req, res) => {
  try {
    const { assignmentId, currentQuery, errorMessage } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ error: 'assignmentId is required.' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const prompt = buildHintPrompt(assignment, currentQuery, errorMessage);

    let hint;
    if (process.env.GEMINI_API_KEY) {
      hint = await callGemini(prompt);
    } else {
      hint = generateFallbackHint(assignment, currentQuery, errorMessage);
    }

    res.json({ hint });
  } catch (err) {
    console.error('Hint error:', err.message);
    res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
};

function buildHintPrompt(assignment, currentQuery, errorMessage) {
  const tableInfo = assignment.tableSchemas
    .map(
      (t) =>
        `Table: ${t.tableName}\nColumns: ${t.columns.map((c) => `${c.name} (${c.type})`).join(', ')}`
    )
    .join('\n\n');

  return `You are a SQL tutor helping a student learn SQL. Your job is to give HINTS only - NEVER provide the complete solution or write the full SQL query for them.

ASSIGNMENT:
Title: ${assignment.title}
Question: ${assignment.question}

Requirements the student must meet:
${assignment.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

DATABASE SCHEMA:
${tableInfo}

STUDENT'S CURRENT QUERY:
${currentQuery || '(No query written yet)'}

${errorMessage ? `CURRENT ERROR:\n${errorMessage}` : ''}

YOUR TASK:
- Identify what concept the student is struggling with
- Give a conceptual hint or a guiding question to help them think in the right direction
- If there's an error, explain what the error means without fixing it for them
- Point to relevant SQL concepts (e.g., "Think about how GROUP BY and HAVING work together")
- Maximum 3-4 sentences
- DO NOT write any SQL code in your response
- DO NOT reveal the answer or complete solution`;
}

async function callGemini(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      maxOutputTokens: 300,
      temperature: 0.7,
    },
  });

  return response.text;
}

function generateFallbackHint(assignment, currentQuery, errorMessage) {
  const tags = assignment.tags || [];
  const hints = [];

  if (errorMessage) {
    if (errorMessage.includes('syntax')) {
      hints.push('You have a syntax error. Check your SQL keywords, comma placement, and that all clauses are in the right order (SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY).');
    } else if (errorMessage.includes('column')) {
      hints.push("There's a column reference issue. Double-check your column names against the schema - SQL is case-insensitive for keywords but the column names must match exactly.");
    } else if (errorMessage.includes('aggregate')) {
      hints.push('When using aggregate functions (SUM, AVG, COUNT, etc.) with other columns, you need GROUP BY. Any column in SELECT that is not inside an aggregate function must be in GROUP BY.');
    } else {
      hints.push(`Error hint: "${errorMessage.substring(0, 100)}". Read the error carefully - PostgreSQL errors are descriptive and usually tell you exactly what went wrong.`);
    }
  } else if (!currentQuery || currentQuery.trim().length < 10) {
    hints.push(`Start with the basics: what table(s) do you need? (${assignment.relevantTables.join(', ')}). Begin with SELECT and think about what columns to retrieve.`);
  } else if (tags.includes('GROUP BY') && !currentQuery.toUpperCase().includes('GROUP BY')) {
    hints.push('Think about aggregation - when you need a summary per group (like per department or per subject), the GROUP BY clause groups your rows before aggregating.');
  } else if (tags.includes('JOIN') && !currentQuery.toUpperCase().includes('JOIN')) {
    hints.push('This question requires combining data from related rows. Think about how JOIN works - you connect tables using a shared column (like an ID).');
  } else if (tags.includes('HAVING') && !currentQuery.toUpperCase().includes('HAVING')) {
    hints.push('You need to filter groups, not individual rows. Remember: WHERE filters rows BEFORE grouping; HAVING filters groups AFTER aggregation.');
  } else {
    hints.push(`Review the requirements again: ${assignment.requirements[0]}. Make sure your query addresses each requirement one by one.`);
  }

  return hints[0];
}