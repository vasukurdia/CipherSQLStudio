const Assignment = require("../models/Assignment");
const { pool } = require("../config/postgres");

const SEED_ASSIGNMENTS = [
  {
    title: "Basic Employee SELECT",
    description:
      "Practice fetching employee records with basic SELECT and WHERE.",
    difficulty: "beginner",
    question:
      "Retrieve the names and salaries of all employees who work in the Engineering department, ordered by salary in descending order.",
    requirements: [
      "Select name and salary columns only",
      'Filter by department = "Engineering"',
      "Order results by salary descending",
    ],
    relevantTables: ["employees"],
    tableSchemas: [
      {
        tableName: "employees",
        columns: [
          { name: "id", type: "SERIAL", description: "Primary key" },
          { name: "name", type: "VARCHAR(100)", description: "Employee name" },
          {
            name: "department",
            type: "VARCHAR(100)",
            description: "Department name",
          },
          {
            name: "salary",
            type: "NUMERIC(10,2)",
            description: "Annual salary",
          },
          { name: "hire_date", type: "DATE", description: "Date of hire" },
          {
            name: "manager_id",
            type: "INT",
            description: "ID of manager (self-ref)",
          },
        ],
      },
    ],
    tags: ["SELECT", "WHERE", "ORDER BY"],
    order: 1,
  },
  {
    title: "Aggregate Functions",
    description:
      "Use GROUP BY and aggregate functions to analyze employee data.",
    difficulty: "beginner",
    question:
      "Find the average salary for each department. Show the department name and average salary, ordered by average salary from highest to lowest.",
    requirements: [
      "Group employees by department",
      "Calculate AVG salary per group",
      "Order by average salary descending",
    ],
    relevantTables: ["employees"],
    tableSchemas: [
      {
        tableName: "employees",
        columns: [
          { name: "id", type: "SERIAL", description: "Primary key" },
          { name: "name", type: "VARCHAR(100)", description: "Employee name" },
          {
            name: "department",
            type: "VARCHAR(100)",
            description: "Department name",
          },
          {
            name: "salary",
            type: "NUMERIC(10,2)",
            description: "Annual salary",
          },
          { name: "hire_date", type: "DATE", description: "Date of hire" },
          {
            name: "manager_id",
            type: "INT",
            description: "Self-referencing manager ID",
          },
        ],
      },
    ],
    tags: ["GROUP BY", "AVG", "ORDER BY"],
    order: 2,
  },
  {
    title: "Product Revenue Analysis",
    description: "Analyze orders to find total revenue per product category.",
    difficulty: "intermediate",
    question:
      "Calculate the total revenue (quantity × price) for each product listed in the orders table. Show only products with total revenue above $500. Display the product name and total revenue, ordered by total revenue descending.",
    requirements: [
      "Calculate total revenue = SUM(quantity * price)",
      "Group by product name",
      "Filter groups where total revenue > 500 using HAVING",
      "Order by total revenue descending",
    ],
    relevantTables: ["orders"],
    tableSchemas: [
      {
        tableName: "orders",
        columns: [
          { name: "id", type: "SERIAL", description: "Order ID" },
          {
            name: "customer_name",
            type: "VARCHAR(100)",
            description: "Customer name",
          },
          {
            name: "product",
            type: "VARCHAR(100)",
            description: "Product ordered",
          },
          { name: "quantity", type: "INT", description: "Number of units" },
          { name: "price", type: "NUMERIC(10,2)", description: "Unit price" },
          { name: "order_date", type: "DATE", description: "Date of order" },
        ],
      },
    ],
    tags: ["GROUP BY", "HAVING", "SUM", "Arithmetic"],
    order: 3,
  },
  {
    title: "JOIN: Employees & Managers",
    description: "Use self-JOIN to find employees and their manager names.",
    difficulty: "intermediate",
    question:
      "List all employees along with their manager's name. If an employee has no manager, show NULL. Display employee name, their department, and manager name. Order by employee name alphabetically.",
    requirements: [
      "Use a self-JOIN on the employees table",
      "Use LEFT JOIN to include employees without managers",
      "Show employee name, department, and manager name",
      "Order by employee name",
    ],
    relevantTables: ["employees"],
    tableSchemas: [
      {
        tableName: "employees",
        columns: [
          { name: "id", type: "SERIAL", description: "Primary key" },
          { name: "name", type: "VARCHAR(100)", description: "Employee name" },
          {
            name: "department",
            type: "VARCHAR(100)",
            description: "Department name",
          },
          {
            name: "salary",
            type: "NUMERIC(10,2)",
            description: "Annual salary",
          },
          { name: "hire_date", type: "DATE", description: "Date of hire" },
          {
            name: "manager_id",
            type: "INT",
            description: "References id of manager in same table",
          },
        ],
      },
    ],
    tags: ["JOIN", "Self-JOIN", "LEFT JOIN"],
    order: 4,
  },
  {
    title: "Top Scoring Students per Subject",
    description:
      "Use window functions or subqueries to find the top scorer in each subject.",
    difficulty: "advanced",
    question:
      "Find the student with the highest score in each subject. Display student name, subject, and their score. Handle ties by showing all tied top-scorers.",
    requirements: [
      "Find max score per subject",
      "Match students who have that max score in their subject",
      "Show name, subject, and score",
      "You may use a subquery, CTE, or window functions",
    ],
    relevantTables: ["students"],
    tableSchemas: [
      {
        tableName: "students",
        columns: [
          { name: "id", type: "SERIAL", description: "Primary key" },
          { name: "name", type: "VARCHAR(100)", description: "Student name" },
          { name: "grade", type: "VARCHAR(5)", description: "Letter grade" },
          { name: "score", type: "NUMERIC(5,2)", description: "Numeric score" },
          {
            name: "subject",
            type: "VARCHAR(100)",
            description: "Subject name",
          },
          {
            name: "enrollment_date",
            type: "DATE",
            description: "Enrollment date",
          },
        ],
      },
    ],
    tags: ["Subquery", "CTE", "Window Functions", "MAX"],
    order: 5,
  },
  {
    title: "Monthly Sales Report",
    description: "Aggregate order data by month to produce a sales report.",
    difficulty: "advanced",
    question:
      "Generate a monthly sales summary for 2024. For each month, show the total number of orders, total revenue, and the most ordered product (by quantity). Display month number, order count, total revenue, and top product.",
    requirements: [
      "Extract month from order_date",
      "Count orders and sum revenue per month",
      "Identify the product with highest total quantity per month",
      "Only include 2024 orders",
    ],
    relevantTables: ["orders"],
    tableSchemas: [
      {
        tableName: "orders",
        columns: [
          { name: "id", type: "SERIAL", description: "Order ID" },
          {
            name: "customer_name",
            type: "VARCHAR(100)",
            description: "Customer name",
          },
          {
            name: "product",
            type: "VARCHAR(100)",
            description: "Product ordered",
          },
          { name: "quantity", type: "INT", description: "Number of units" },
          { name: "price", type: "NUMERIC(10,2)", description: "Unit price" },
          { name: "order_date", type: "DATE", description: "Date of order" },
        ],
      },
    ],
    tags: ["DATE", "EXTRACT", "CTE", "Subquery", "Window Functions"],
    order: 6,
  },
];

exports.seedAssignments = async () => {
  const count = await Assignment.countDocuments();
  if (count === 0) {
    await Assignment.insertMany(SEED_ASSIGNMENTS);
    console.log("✅ Assignments seeded to MongoDB");
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ isActive: true })
      .select("title description difficulty tags order relevantTables")
      .sort({ order: 1 });
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const sampleData = {};
    for (const tableName of assignment.relevantTables) {
      try {
        const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 10`);
        sampleData[tableName] = {
          columns: result.fields.map((f) => f.name),
          rows: result.rows,
        };
      } catch (_) {
        sampleData[tableName] = { columns: [], rows: [] };
      }
    }

    res.json({ assignment, sampleData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

Assignment.countDocuments().then((count) => {
  if (count === 0) {
    Assignment.insertMany(SEED_ASSIGNMENTS)
      .then(() => console.log("✅ Assignments seeded"))
      .catch(console.error);
  }
});
