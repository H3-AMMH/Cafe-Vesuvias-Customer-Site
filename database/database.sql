PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_role_id INTEGER NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_role_id) REFERENCES user_roles(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY,
    table_number INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    description_danish TEXT NOT NULL,
    description_english TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    isAvailable BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS item_ingredients (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    FOREIGN KEY (item_id) REFERENCES menu_items(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    tel TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    tables_needed INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS reservation_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE CASCADE,
    UNIQUE(reservation_id, table_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservation_id INTEGER NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL CHECK(unit_price > 0),
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS timetable (
    clock TIME NOT NULL PRIMARY KEY,
    occupied_tables INTEGER NOT NULL DEFAULT 0
);

INSERT INTO categories (id, name) VALUES
(1, 'Food'),
(2, 'Drinks');

INSERT INTO user_roles (id, role_name) VALUES
(1, 'admin'),
(2, 'waiter'),
(3, 'chef');

INSERT INTO users (id, first_name, last_name, user_role_id, email, password_hash, phone) VALUES
(1, 'Admin', 'User', 1, 'Admin@gmail.com', '$2b$10$3Kn7oerCSLiPsp2BIfgiJeqG5XkHwtNY97zHmLdmNERlHFxryqjOq', '12345678');

-- Example data for tables (now only 28 tables)
INSERT INTO tables (id, table_number) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10),
(11, 11),
(12, 12),
(13, 13),
(14, 14),
(15, 15),
(16, 16),
(17, 17),
(18, 18),
(19, 19),
(20, 20),
(21, 21),
(22, 22),
(23, 23),
(24, 24),
(25, 25),
(26, 26),
(27, 27),
(28, 28);

INSERT INTO timetable (clock, occupied_tables) VALUES
('13:00:00', 0),
('13:10:00', 0),
('13:20:00', 0),
('13:30:00', 0),
('13:40:00', 0),
('13:50:00', 0),
('14:00:00', 0),
('14:10:00', 0),
('14:20:00', 0),
('14:30:00', 0),
('14:40:00', 0),
('14:50:00', 0),
('15:00:00', 0),
('15:10:00', 0),
('15:20:00', 0),
('15:30:00', 0),
('15:40:00', 0),
('15:50:00', 0),
('16:00:00', 0),
('16:10:00', 0),
('16:20:00', 0),
('16:30:00', 0),
('16:40:00', 0),
('16:50:00', 0),
('17:00:00', 0),
('17:10:00', 0),
('17:20:00', 0),
('17:30:00', 0),
('17:40:00', 0),
('17:50:00', 0),
('18:00:00', 0),
('18:10:00', 0),
('18:20:00', 0),
('18:30:00', 0),
('18:40:00', 0),
('18:50:00', 0),
('19:00:00', 0),
('19:10:00', 0),
('19:20:00', 0),
('19:30:00', 0),
('19:40:00', 0),
('19:50:00', 0),
('20:00:00', 0),
('20:10:00', 0),
('20:20:00', 0),
('20:30:00', 0),
('20:40:00', 0),
('20:50:00', 0),
('21:00:00', 0),
('21:10:00', 0),
('21:20:00', 0),
('21:30:00', 0),
('21:40:00', 0),
('21:50:00', 0),
('22:00:00', 0);