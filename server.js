const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const app = express();
const port = 3000;

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "todo_db",
  password: "2004",
  port: 5432,
});

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    res.render("index", { todos: result.rows });
  } catch (err) {
    res.send("Error loading todos");
  }
});

app.post("/add", async (req, res) => {
  const { task } = req.body;
  if (task.trim()) {
    await pool.query("INSERT INTO todos (task) VALUES ($1)", [task]);
  }
  res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM todos WHERE id=$1", [id]);
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Todo app listening at http://localhost:${port}`);
});
