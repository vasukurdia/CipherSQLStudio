const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'ciphersqlstudio_sandbox',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function connectPostgres() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  }
}


async function initPostgresTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(100),
        salary NUMERIC(10,2),
        hire_date DATE,
        manager_id INT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        budget NUMERIC(12,2),
        location VARCHAR(100)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100),
        product VARCHAR(100),
        quantity INT,
        price NUMERIC(10,2),
        order_date DATE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(100),
        price NUMERIC(10,2),
        stock INT
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        grade VARCHAR(5),
        score NUMERIC(5,2),
        subject VARCHAR(100),
        enrollment_date DATE
      );
    `);

    const { rows } = await client.query('SELECT COUNT(*) FROM employees');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO departments (name, budget, location) VALUES
          ('Engineering', 500000, 'New York'),
          ('Marketing', 200000, 'Los Angeles'),
          ('HR', 150000, 'Chicago'),
          ('Finance', 300000, 'New York'),
          ('Sales', 250000, 'Houston');
      `);

      await client.query(`
        INSERT INTO employees (name, department, salary, hire_date, manager_id) VALUES
          ('Alice Johnson', 'Engineering', 95000, '2020-03-15', NULL),
          ('Bob Smith', 'Engineering', 88000, '2019-07-22', 1),
          ('Carol White', 'Marketing', 72000, '2021-01-10', NULL),
          ('David Brown', 'Engineering', 102000, '2018-05-30', 1),
          ('Eve Davis', 'HR', 65000, '2022-02-14', NULL),
          ('Frank Wilson', 'Finance', 85000, '2020-09-01', NULL),
          ('Grace Lee', 'Engineering', 91000, '2021-06-20', 1),
          ('Henry Martinez', 'Sales', 70000, '2019-11-15', NULL),
          ('Iris Taylor', 'Marketing', 68000, '2022-04-05', 3),
          ('Jack Anderson', 'Finance', 78000, '2021-08-12', 6);
      `);

      await client.query(`
        INSERT INTO products (name, category, price, stock) VALUES
          ('Laptop Pro', 'Electronics', 1299.99, 45),
          ('Wireless Mouse', 'Electronics', 29.99, 200),
          ('Office Chair', 'Furniture', 349.99, 30),
          ('Standing Desk', 'Furniture', 599.99, 15),
          ('USB-C Hub', 'Electronics', 49.99, 120),
          ('Monitor 27"', 'Electronics', 399.99, 60),
          ('Keyboard Mech', 'Electronics', 149.99, 80),
          ('Notebook', 'Stationery', 4.99, 500),
          ('Pen Set', 'Stationery', 12.99, 300),
          ('Headphones', 'Electronics', 199.99, 75);
      `);

      await client.query(`
        INSERT INTO orders (customer_name, product, quantity, price, order_date) VALUES
          ('Alice Corp', 'Laptop Pro', 2, 1299.99, '2024-01-05'),
          ('Bob Ltd', 'Wireless Mouse', 10, 29.99, '2024-01-08'),
          ('Carol Inc', 'Monitor 27"', 5, 399.99, '2024-01-12'),
          ('David Corp', 'Office Chair', 3, 349.99, '2024-01-15'),
          ('Eve LLC', 'USB-C Hub', 8, 49.99, '2024-02-01'),
          ('Frank Co', 'Laptop Pro', 1, 1299.99, '2024-02-10'),
          ('Alice Corp', 'Keyboard Mech', 4, 149.99, '2024-02-14'),
          ('Bob Ltd', 'Headphones', 2, 199.99, '2024-02-20'),
          ('Carol Inc', 'Notebook', 50, 4.99, '2024-03-01'),
          ('David Corp', 'Standing Desk', 2, 599.99, '2024-03-05'),
          ('Eve LLC', 'Pen Set', 20, 12.99, '2024-03-10'),
          ('Grace Shop', 'Monitor 27"', 3, 399.99, '2024-03-15');
      `);

      await client.query(`
        INSERT INTO students (name, grade, score, subject, enrollment_date) VALUES
          ('Liam Parker', 'A', 92.5, 'Mathematics', '2023-09-01'),
          ('Mia Thompson', 'B', 84.0, 'Science', '2023-09-01'),
          ('Noah Garcia', 'A', 95.0, 'Mathematics', '2023-09-01'),
          ('Olivia Martinez', 'C', 74.5, 'History', '2023-09-01'),
          ('Peyton Clark', 'B', 81.0, 'Science', '2023-09-01'),
          ('Quinn Robinson', 'A', 90.0, 'English', '2023-09-01'),
          ('Riley Lewis', 'D', 65.5, 'Mathematics', '2023-09-01'),
          ('Sam Walker', 'B', 88.0, 'History', '2023-09-01'),
          ('Taylor Hall', 'A', 97.0, 'Science', '2023-09-01'),
          ('Umar Young', 'C', 72.0, 'English', '2023-09-01');
      `);

      console.log('✅ PostgreSQL sandbox seeded');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ PostgreSQL init error:', err.message);
  } finally {
    client.release();
  }
}

module.exports = { pool, connectPostgres, initPostgresTables };
