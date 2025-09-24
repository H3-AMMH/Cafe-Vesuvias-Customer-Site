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

// Api key middleware
const apiKeyAuth = (req, res, next) => {
  const key = req.headers["x-api-key"];
  if (key && key === process.env.API_KEY) {
    return next();
  }
  return res.status(403).json({ error: "Invalid API key or its missing" });
}

// Protects all /api routes
app.use("/api", apiKeyAuth);

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
// ---------- END DB initialization ----------

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//#region MENU SYSTEM

app.get("/api/menu", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM menu_items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category_id, description_danish, description_english, price, isAvailable } = req.body;
  const db = new sqlite3.Database(dbPath);

  if (!name || !category_id || !description_danish || !description_english || price === undefined || isAvailable === undefined) {
    res.status(400).json({ error: 'Name and price are required' });
    return;
  }

  db.run(
    'INSERT INTO menu_items (name, category_id, description_danish, description_english, price, isAvailable) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category_id, description_danish, description_english, price, isAvailable],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, category_id, description_danish, description_english, price, isAvailable });
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

//Menu full update
app.put('/api/menu/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { name, category_id, description_danish, description_english, price, isAvailable } = req.body;

  if (!name || !category_id || !description_danish || !description_english || price === undefined || isAvailable === undefined) {
    res.status(400).json({ error: 'One or more values are null' });
    return;
  }

  db.run(
    'UPDATE menu_items SET name = ?, category_id = ?, description_danish = ?, description_english = ?, price = ?, isAvailable = ? WHERE id = ?',
    [name, category_id, description_danish, description_english, price, isAvailable, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ success: true, updatedId: name, category_id, description_danish, description_english, price, isAvailable, id });
    }
  );
});

//Menu available update
app.patch('/api/menu/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { isAvailable } = req.body;

  if (isAvailable === undefined) {
    res.status(400).json({ error: 'One value is null' });
    return;
  }

  db.run(
    'UPDATE menu_items SET isAvailable = ? WHERE id = ?',
    [isAvailable, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json({ success: true, updatedId: isAvailable, id });
    }
  );
});


//#endregion

//#region RESERVATION SYSTEM

app.get("/api/reservations", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  const { date, future } = req.query;

  let sql = "SELECT * FROM reservations";
  let params = [];

  if (future === "true") {
    sql += " WHERE date >= date('now', 'localtime')";
  } else if (date) {
    sql += " WHERE date = ?";
    params.push(date);
  } else {
    sql += " WHERE date = date('now', 'localtime')";
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

// Reservation creation: assign tables automatically
app.post('/api/reservations', (req, res) => {
  const { name, tel, date, time, party_size } = req.body;
  if (!name || !tel || !date || !time || !party_size) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const partySizeInt = parseInt(party_size, 10);
  if (isNaN(partySizeInt) || partySizeInt < 1) {
    return res.status(400).json({ error: "Invalid party size" });
  }
  const tablesNeeded = Math.ceil(partySizeInt / 2);
  const MAX_TABLES = 28;

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

  // Find available tables for the requested time slot
  const checkSql = `
    SELECT t.id, t.table_number
    FROM tables t
    WHERE t.id NOT IN (
      SELECT rt.table_id
      FROM reservation_tables rt
      JOIN reservations r ON rt.reservation_id = r.id
      WHERE r.date = ?
        AND r.status = 'open'
        AND r.time < time(?, '+2 hours')
        AND time(r.time, '+2 hours') > time(?)
    )
    LIMIT ?
  `;

  db.all(checkSql, [date, time, time, tablesNeeded], (err, availableTables) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: "Database check error" });
    }
    if (availableTables.length < tablesNeeded) {
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
        const reservationId = this.lastID;
        // Assign tables to reservation
        const stmt = db.prepare(
          "INSERT INTO reservation_tables (reservation_id, table_id) VALUES (?, ?)"
        );
        for (let i = 0; i < tablesNeeded; i++) {
          stmt.run(reservationId, availableTables[i].id);
        }
        stmt.finalize((err) => {
          db.close();
          if (err) {
            return res.status(500).json({ error: "Failed to assign tables" });
          }
          res.status(201).json({ success: true, reservation_id: reservationId, tables: availableTables.slice(0, tablesNeeded).map(t => t.table_number) });
        });
      }
    );
  });
});

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

//#endregion

//#region ORDER SYSTEM

// Get orders with table numbers (via reservation_tables)
app.get("/api/orders", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all(
    `SELECT o.*, r.name as reservation_name, GROUP_CONCAT(t.table_number) as table_numbers
     FROM orders o
     JOIN reservations r ON o.reservation_id = r.id
     LEFT JOIN reservation_tables rt ON r.id = rt.reservation_id
     LEFT JOIN tables t ON rt.table_id = t.id
     GROUP BY o.id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
      db.close();
    }
  );
});

// Create a new order (only needs reservation_id)
app.post('/api/orders', (req, res) => {
  const { reservation_id } = req.body;
  if (!reservation_id) {
    return res.status(400).json({ error: 'reservation_id is required' });
  }
  const db = new sqlite3.Database(dbPath);
  db.run(
    'INSERT INTO orders (reservation_id) VALUES (?)',
    [reservation_id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      res.status(201).json({ id: this.lastID, reservation_id });
      db.close();
    }
  );
});

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

app.patch('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  const { reservation_id, status } = req.body;

  if (!reservation_id) {
    res.status(400).json({ error: 'reservation_id is required' });
    db.close();
    return;
  }

  db.run(
    'UPDATE orders SET reservation_id = ?, status = COALESCE(?, status) WHERE id = ?',
    [reservation_id, status, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
        db.close();
        return;
      }
      res.json({ success: true, updatedId: id, reservation_id, status });
      db.close();
    }
  );
});

app.post('/api/order_lines', (req, res) => {
  const { order_id, menu_item_id, quantity, unit_price } = req.body;
  if (!order_id || !menu_item_id || !quantity || !unit_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const db = new sqlite3.Database(dbPath);
  db.run(
    'INSERT INTO order_lines (order_id, menu_item_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
    [order_id, menu_item_id, quantity, unit_price],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        db.close();
        return;
      }
      res.status(201).json({ id: this.lastID, order_id, menu_item_id, quantity, unit_price });
      db.close();
    }
  );
});

// get order lines for a specific order
app.get('/api/order_lines/:order_id', (req, res) => {
  const order_id = req.params.order_id;
  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT ol.*, mi.name, mi.description_danish, mi.description_english FROM order_lines ol JOIN menu_items mi ON ol.menu_item_id = mi.id WHERE ol.order_id = ?',
    [order_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
      db.close();
    }
  );
});

// Get all order lines (with menu item info)
app.get('/api/order_lines', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all(
    'SELECT ol.*, mi.name, mi.description_danish, mi.description_english FROM order_lines ol JOIN menu_items mi ON ol.menu_item_id = mi.id',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
      db.close();
    }
  );
});

// Update an order line's quantity
app.patch('/api/order_lines/:id', (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' });
  const db = new sqlite3.Database(dbPath);
  db.run(
    'UPDATE order_lines SET quantity = ? WHERE id = ?',
    [quantity, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Order line not found' });
      res.json({ success: true, updatedId: id, quantity });
      db.close();
    }
  );
});

// Delete an order line
app.delete('/api/order_lines/:id', (req, res) => {
  const id = req.params.id;
  const db = new sqlite3.Database(dbPath);
  db.run('DELETE FROM order_lines WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order line not found' });
    res.json({ success: true, deletedId: id });
    db.close();
  });
});

app.get("/api/categories", (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows);
    db.close();
  });
});

//#endregion

  //#region ORDER LINES SYSTEM

  // DONE

  app.get("/api/orderlines", (req, res) => {
    const db = new sqlite3.Database(dbPath);
    db.all("SELECT * FROM order_lines", [], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
      db.close();
    });
  });

  // DONE

  app.post('/api/orderlines', (req, res) => {
    const { order_id, menu_item_id, quantity, unit_price } = req.body;
    const db = new sqlite3.Database(dbPath);

    if (!order_id || !menu_item_id || quantity === undefined || unit_price === undefined) {
      res.status(400).json({ error: 'One or more values are null' });
      return;
    }

    db.run(
      'INSERT INTO order_lines (order_id, menu_item_id, quantity, unit_price) VALUES (?,?,?,?)',
      [order_id, menu_item_id, quantity, unit_price],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, order_id, menu_item_id, quantity, unit_price });
      }
    );
  });

  // DONE

  app.delete('/api/orderlines/:id', (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(dbPath);

    db.run('DELETE FROM order_lines WHERE id = ?', [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Order-line not found' });
        return;
      }
      res.json({ success: true, deletedId: id });
    });
  });

  // DONE

  app.put('/api/orderlines/:id', (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(dbPath);
    const { order_id, menu_item_id, quantity, unit_price } = req.body;

    if (!order_id || !menu_item_id || quantity === undefined || unit_price === undefined) {
      res.status(400).json({ error: 'One or more values are null' });
      return;
    }

    db.run(
      'UPDATE order_lines SET order_id = ?, menu_item_id = ?, quantity = ?, unit_price = ? WHERE id = ?',
      [order_id, menu_item_id, quantity, unit_price, id],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        if (this.changes === 0) {
          res.status(404).json({ error: 'Order-line not found' });
          return;
        }
        res.json({ success: true, updatedId: order_id, menu_item_id, quantity, unit_price, id });
      }
    );
  });

  //#endregion

  //#region TIMETABLE SYSTEM

  app.get("/api/timetables", (req, res) => {
    const db = new sqlite3.Database(dbPath);
    db.all("SELECT * FROM timetable WHERE occupied_tables < 56", [], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
      db.close();
    });
  });

  //#endregion

  // Start HTTPS server
  https.createServer(options, app).listen(port, '0.0.0.0', () => {
    console.log(`HTTPS server running on https://0.0.0.0:${port}`);
  });
  //#endregion