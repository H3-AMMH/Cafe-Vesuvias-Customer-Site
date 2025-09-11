const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Paths
const dbPath = path.join(__dirname, "database", "database.sqlite");
const schemaPath = path.join(__dirname, "database", "database.sql");

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

app.get("/api/reservation", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM reservations", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

// DONE

app.post('/api/reservation', (req, res) => {
  const { phone, table_id, time } = req.body;
  const db = new sqlite3.Database(dbPath);

  if (!phone || !table_id || !time) {
    res.status(400).json({ error: 'One or more values are null' });
    return;
  }

  db.run(
    'INSERT INTO reservations (phone, table_id, time) VALUES (?, ?, ?)',
    [phone, table_id, time],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, phone, table_id, time });
    }
  );
});

// DONE

app.delete('/api/reservation/:id', (req, res) => {
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

app.put('/api/reservation/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { phone, table_id, time} = req.body;

  if (!phone || !table_id || !time) {
    res.status(400).json({ error: 'One or more values are null' });
    return;
  }

  db.run(
    'UPDATE reservations SET phone = ?, table_id = ?, time = ? WHERE id = ?',
    [phone, table_id, time, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }
      res.json({ success: true, updatedId: phone, table_id, time, id});
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

app.put('/api/orders/:id', (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
