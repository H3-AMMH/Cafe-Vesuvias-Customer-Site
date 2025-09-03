const port = 3000;
const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite = require('sqlite3');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname + '/public'));

// Explicitly serve index.js from root
app.get('/index.js', (req, res) => {
  res.sendFile(__dirname + '/index.js');
});
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
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const htmlPath = path.join(__dirname, './index.html');

app.get('/', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all('SELECT * FROM menu_items', [], (err, rows) => {
    if (err) return res.status(500).send('Database error');

    const drinks = rows.filter(item => item.category_id === 1);
    const dishes = rows.filter(item => item.category_id === 2);

    const renderItems = (items) => items.map(item => `
      <div class="menu-item menu-item-header">
        <h2>${item.name}</h2>
        <h3>${item.description_danish}</h3>
        <h4>${item.description_english}</h4>
        <p>${item.price.toFixed(2)} kr.</p>
      </div>
    `).join('');

    fs.readFile(path.join(__dirname, htmlPath), 'utf8', (err, html) => {
      if (err) return res.status(500).send('Template error');

      html = html.replace(
        '<div class="menu-column" id="menu-dish-column">',
        `<div class="menu-column" id="menu-dish-column">${renderItems(dishes)}`
      );

      html = html.replace(
        '<div class="menu-column" id="menu-drinks-column">',
        `<div class="menu-column" id="menu-drinks-column">${renderItems(drinks)}`
      );

      res.send(html);
    });
  });
});

/*
app.post('/add-dish', (req, res) => {
  const { name, description_danish, description_english, price } = req.body;

  if (!name || !description_danish || !description_english || !price) {
    return res.status(400).send('Mangler navn, beskrivelse på dansk, beskrivelse på engelsk eller pris');
  }

  const db = new sqlite3.Database(dbPath);

  db.run(
    'INSERT INTO menu_items (name, description_danish, description_english, price) VALUES (?, ?, ?, ?)',
    [name, description_danish, description_english, parseFloat(price)],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Database insert error');
      }

      res.redirect('/');
    }
  );
});*/

/*
app.get('/edit-menu', (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all('SELECT * FROM menu_items', [], (err, rows) => {
    if (err) {
      return res.status(500).send('Database error');
    }
    res.render('edit-menu', { menu: rows });
  });
});*/

/*
app.post('/update-dish/:id', (req, res) => {
  const { name, price } = req.body;
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  db.run(
    'UPDATE menu_items SET name = ?, description_danish = ?, description_english = ?, price = ? WHERE id = ?',
    [name, description_danish, description_english, parseFloat(price), id],
    function (err) {
      if (err) {
        return res.status(500).send('Database update error');
      }
      res.redirect('/edit-menu');
    }
  );
});*/

/*
app.post('/delete-dish/:id', (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  db.run(
    'DELETE FROM menu_items WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        return res.status(500).send('Database delete error');
      }
      res.redirect('/edit-menu');
    }
  );
});*/