// hintController.js
const { GoogleGenAI } = require('@google/genai');
const Assignment = require('../models/Assignment');

// ====== Fallback Hints for each assignment ======
const AssignmentHints = {
  'Basic Employee SELECT': [
    'Think about which columns you need: name and salary.',
    'Use WHERE to filter employees in the Engineering department.',
    'ORDER BY salary descending will sort highest salary first.',
    'Follow the sequence: SELECT → FROM → WHERE → ORDER BY.'
  ],
  'Aggregate Functions': [
    'Use GROUP BY when summarizing data per department.',
    'Calculate AVG(salary) for each group.',
    'ORDER BY the aggregate to show highest average first.',
    'Remember, non-aggregated columns in SELECT must be in GROUP BY.'
  ],
  'Product Revenue Analysis': [
    'Compute total revenue: quantity × price, then SUM per product.',
    'Use GROUP BY product name to aggregate correctly.',
    'Filter with HAVING for total revenue > 500.',
    'ORDER BY SUM(quantity * price) DESC to see top revenue first.'
  ],
  'JOIN: Employees & Managers': [
    'Use a self-JOIN to link employees with their managers.',
    'LEFT JOIN ensures employees without managers appear as NULL.',
    'Select employee name, department, and manager name.',
    'Order results alphabetically by employee name.'
  ],
  'Top Scoring Students per Subject': [
    'Find max score per subject using GROUP BY or window functions.',
    'Use subquery, CTE, or RANK()/DENSE_RANK() to handle ties.',
    'Select student name, subject, and score.',
    'Ensure all top scorers are included if there is a tie.'
  ],
  'Monthly Sales Report': [
    'Extract month from order_date using EXTRACT(MONTH FROM order_date).',
    'COUNT(*) gives total orders, SUM(quantity*price) gives total revenue.',
    'Use window functions or subqueries to identify top product per month.',
    'Filter only 2024 orders using WHERE.'
  ],
};

function getFallbackHint(assignmentTitle) {
  const hints = AssignmentHints[assignmentTitle];
  if (!hints || hints.length === 0)
    return 'Review the assignment requirements carefully and think step by step.';
  return hints[Math.floor(Math.random() * hints.length)]; // Random hint
}

// ====== Main Controller ======
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

    let hint = null;

    // 1️⃣ Try AI hint first if API key exists
    if (process.env.GEMINI_API_KEY) {
      hint = await callGeminiWithFallback(assignment, currentQuery, errorMessage);
    }

    // 2️⃣ Fallback hint if AI fails / quota exceeded / no key
    if (!hint) {
      hint = generateFallbackHint(assignment, currentQuery, errorMessage);
    }

    res.json({ hint });
  } catch (err) {
    console.error('Hint error:', err.message);
    res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
};

// ====== Build AI Prompt ======
function buildHintPrompt(assignment, currentQuery, errorMessage) {
  const tableInfo = assignment.tableSchemas
    .map(
      (t) =>
        `Table: ${t.tableName}\nColumns: ${t.columns
          .map((c) => `${c.name} (${c.type})`)
          .join(', ')}`
    )
    .join('\n\n');

  return `You are a SQL tutor helping a student learn SQL. Give conceptual hints only, max 3-4 sentences, no complete solution.

ASSIGNMENT:
Title: ${assignment.title}
Question: ${assignment.question}

Requirements:
${assignment.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

DATABASE SCHEMA:
${tableInfo}

STUDENT QUERY:
${currentQuery || '(No query yet)'}

${errorMessage ? `CURRENT ERROR:\n${errorMessage}` : ''}

Focus on:
- Guiding the student conceptually
- Explain errors without fixing
- Mention relevant SQL concepts
- DO NOT write full SQL queries`;
}

// ====== Call Gemini AI ======
async function callGeminiWithFallback(assignment, currentQuery, errorMessage) {
  const prompt = buildHintPrompt(assignment, currentQuery, errorMessage);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { maxOutputTokens: 300, temperature: 0.7 },
    });

    return response.text;
  } catch (err) {
    console.error('Gemini API failed:', err.message);

    // Quota exceeded triggers fallback
    if (err?.error?.code === 429 || err?.status === 'RESOURCE_EXHAUSTED') {
      console.warn('Gemini quota exceeded. Using fallback hint.');
    }

    return null;
  }
}

// ====== Generate Fallback Hint ======
function generateFallbackHint(assignment, currentQuery, errorMessage) {
  const tags = assignment.tags || [];
  const hints = [];

  if (errorMessage) {
    if (errorMessage.toLowerCase().includes('syntax')) {
      hints.push('You have a syntax error. Check SQL keywords, commas, and clause order.');
    } else if (errorMessage.toLowerCase().includes('column')) {
      hints.push(
        'Check column names against schema; SQL keywords are case-insensitive but columns must match exactly.'
      );
    } else if (errorMessage.toLowerCase().includes('aggregate')) {
      hints.push(
        'Aggregate functions require proper GROUP BY usage. Non-aggregated columns must be in GROUP BY.'
      );
    } else {
      hints.push(`Error hint: "${errorMessage.split(':')[0]}". Think conceptually about the problem.`);
    }
  } else if (!currentQuery || currentQuery.trim().length < 10) {
    hints.push(
      `Start with the basics: which table(s) do you need? (${assignment.relevantTables.join(
        ', '
      )}). Focus on SELECT first.`
    );
  } else {
    if (tags.includes('GROUP BY') && !currentQuery.toUpperCase().includes('GROUP BY')) {
      hints.push('Remember to group data when using SUM, COUNT, AVG.');
    }
    if (tags.includes('JOIN') && !currentQuery.toUpperCase().includes('JOIN')) {
      hints.push('Consider how tables are connected. JOIN on common columns may be required.');
    }
    if (tags.includes('HAVING') && !currentQuery.toUpperCase().includes('HAVING')) {
      hints.push('HAVING filters groups after aggregation; WHERE filters rows before aggregation.');
    }
  }

  if (hints.length === 0) {
    hints.push(`Review requirements carefully: ${assignment.requirements[0]}. Make sure your query addresses each point.`);
  }

  // Merge assignment-specific hints
  const fallbackHint = getFallbackHint(assignment.title);
  return hints[0] || fallbackHint;
}