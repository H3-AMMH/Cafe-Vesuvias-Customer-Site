const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "../database/test_cafe.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.log("Failed to connect to test db:", err);
    else console.log("Connected to test db at", dbPath);
});

module.exports = db;