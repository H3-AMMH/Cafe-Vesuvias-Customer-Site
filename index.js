const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Paths
const dbPath = path.join(__dirname, "database", "database.sqlite");
const schemaPath = path.join(__dirname, "database", "database.sql");

// Initialize DB if missing
if (!fs.existsSync(dbPath)) {
  console.log("Database not found. Creating from database.sql...");
  const initDb = new sqlite3.Database(dbPath);
  const schema = fs.readFileSync(schemaPath, "utf8");
  initDb.exec(schema, (err) => {
    if (err) console.error("Error creating database:", err);
    else console.log("Database created successfully.");
    initDb.close();
  });
}

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoint for menu data
app.get("/api/menu", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM menu_items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
