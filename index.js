require("dotenv").config();
const express = require("express");
const fs = require("fs");
const https = require("https");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = process.env.DB_PATH;
const app = express();
const port = 3000;

// Reads SSL cert and key
const options = {
  key: fs.readFileSync("/etc/ssl/cafe-menu/server.key"),
  cert: fs.readFileSync("/etc/ssl/cafe-menu/server.crt")
};


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Paths
const schemaPath = path.join(__dirname, "database", "database.sql");

// ---------- DB initialization ----------
if (!fs.existsSync(dbPath)) {
  console.log(`DB at ${dbPath} does not exist!`);
  console.log("Please make sure the database file exists at the path specified in DB_PATH.");
} else {
  console.log(`DB found at ${dbPath}`);
}
// ---------- End DB initialization ----------

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

//#region MENU SYSTEM

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/menu", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM menu_items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category_id, description_danish, description_english, price } = req.body;
  const db = new sqlite3.Database(dbPath);

  if (!name || !category_id || !description_danish || !description_english || price === undefined) {
    res.status(400).json({ error: 'Name and price are required' });
    return;
  }

  db.run(
    'INSERT INTO menu_items (name, category_id, description_danish, description_english, price) VALUES (?, ?, ?, ?, ?)',
    [name, category_id, description_danish, description_english, price],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, category_id, description_danish, description_english, price });
    }
  );
});

app.delete('/api/menu/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);

  db.run('DELETE FROM menu_items WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ success: true, deletedId: id });
  });
});

app.put('/api/menu/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { name, category_id, description_danish, description_english, price} = req.body;

  if (!name || !category_id || !description_danish || !description_english || price === undefined) {
    res.status(400).json({ error: 'Name and price are required' });
    return;
  }

  db.run(
    'UPDATE menu_items SET name = ?, category_id = ?, description_danish = ?, description_english = ?, price = ? WHERE id = ?',
    [name, category_id, description_danish, description_english, price, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ success: true, updatedId: name, category_id, description_danish, description_english, price, id});
    }
  );
});


//#region RESERVATION SYSTEM

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "booking.html"));
});

// DONE

app.get("/api/reservations", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { date, future } = req.query;

  let sql = "SELECT * FROM reservations";
  let params = [];

  if (future === "true") {
    // Get all reservations from today and onwards
    sql += " WHERE date >= date('now', 'localtime')";
  } else if (date) {
    // Get reservations for a specific date
    sql += " WHERE date = ?";
    params.push(date);
  } else {
    // Default: get today's reservations
    sql += " WHERE date = date('now', 'localtime')";
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

// DONE

app.post('/api/reservations', (req, res) => {

  console.log("Database path =" + dbPath);
  const { name, tel, date, time, party_size } = req.body;
  if (!name || !tel || !date || !time || !party_size) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const partySizeInt = parseInt(party_size, 10);
  if (isNaN(partySizeInt) || partySizeInt < 1) {
    return res.status(400).json({ error: "Invalid party size" });
  }
  const tablesNeeded = Math.ceil(partySizeInt / 2);
  const MAX_TABLES = 56;

  const db = new sqlite3.Database(dbPath);

  // Set the status to 'closed' and make the tables available again after 2 hours from the reservation time
  const now = new Date();
  const nowISO = now.toISOString().slice(0, 19).replace('T', ' ');
  db.run(
    `UPDATE reservations SET status = 'closed' WHERE status = 'open' AND datetime(date || ' ' || time) <= datetime(?, '-2 hours')`,
    [nowISO],
    function (err) {
      if (err) {
        console.error("Error auto-closing reservations:", err);
      }
    }
  );

  const checkSql = `
    SELECT COALESCE(SUM(tables_needed), 0) AS tables_booked
    FROM reservations
    WHERE date = ?
      AND status = 'open'
      AND time < time(?, '+2 hours')
      AND time(time, '+2 hours') > time(?)
  `;

  db.get(checkSql, [date, time, time], (err, row) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: "Database check error" });
    }

    if (row.tables_booked + tablesNeeded > MAX_TABLES) {
      db.close();
      return res.status(400).json({ error: "Ikke nok borde til rådighed på dette tidspunkt." });
    }

    db.run(
      `INSERT INTO reservations (name, tel, date, time, party_size, tables_needed, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [name, tel, date, time, partySizeInt, tablesNeeded],
      function (err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: "Database insert error" });
        }
        res.status(201).json({ success: true, reservation_id: this.lastID });
        db.close();
      }
    );
  });
});

// DONE

app.delete('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);

  db.run('DELETE FROM reservations WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }
    res.json({ success: true, deletedId: id });
  });
});

// DONE

app.put('/api/reservations/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { phone, table_id, reservation_time} = req.body;
  /*
  if (!phone || table_id === undefined || !reservation_time) {
    res.status(400).json({ error: 'One or more values are null' });
    return;
  }
  */
  db.run(
    'UPDATE reservations SET phone = ?, table_id = ?, reservation_time = ? WHERE id = ?',
    [phone, table_id, reservation_time, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }
      res.json({ success: true, updatedId: phone, table_id, reservation_time, id});
    }
  );
});

//#endregion

//#region ORDER SYSTEM

app.get("/api/orders", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

// DONE

app.post('/api/orders', (req, res) => {
  const { reservation_id} = req.body;
  const db = new sqlite3.Database(dbPath);

  if (!reservation_id) {
    res.status(400).json({ error: 'reservation_id is null' });
    return;
  }

  db.run(
    'INSERT INTO orders (reservation_id) VALUES (?)',
    [reservation_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, reservation_id });
    }
  );
});

// DONE

app.delete('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);

  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ success: true, deletedId: id });
  });
});

// DONE

app.patch('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { reservation_id, status, created_at} = req.body;

  if (!reservation_id) {
    res.status(400).json({ error: 'reservation_id is null' });
    return;
  }

  db.run(
    'UPDATE orders SET reservation_id = ?, status = status, created_at = created_at WHERE id = ?',
    [reservation_id, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json({ success: true, updatedId: reservation_id, id});
    }
  );
});

//#endregion

// Start HTTPS server
https.createServer(options, app).listen(port, '0.0.0.0', () => {
  console.log(`HTTPS server running on https://0.0.0.0:${port}`);
});

