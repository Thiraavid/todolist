const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection using DATABASE_URL or fallback config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:2004@localhost:5432/todo_db",
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Needed for deployment like Render
});

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Ensure views folder path
app.use(express.static(path.join(__dirname, "public"))); // Optional for static assets
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    res.render("index", { todos: result.rows });
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).send("Error loading todos.");
  }
});

app.post("/add", async (req, res) => {
  const { task } = req.body;
  if (task && task.trim()) {
    try {
      await pool.query("INSERT INTO todos (task) VALUES ($1)", [task.trim()]);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  }
  res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM todos WHERE id=$1", [id]);
  } catch (err) {
    console.error("Error deleting task:", err);
  }
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
