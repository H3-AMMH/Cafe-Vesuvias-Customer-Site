CREATE TABLE tables (
    id INTEGER PRIMARY KEY,
    table_number INTEGER
);

CREATE TABLE reservations (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    table_id INTEGER,
    time DATETIME,
    FOREIGN KEY (customer_id) REFERENCES online_customers(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category_id INTEGER,
    description_danish TEXT,
    description_english TEXT,
    price DECIMAL(10,2),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30)
);

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT
);

CREATE TABLE item_ingredients (
    id INTEGER PRIMARY KEY,
    item_id INTEGER,
    ingredient_id INTEGER,
    FOREIGN KEY (item_id) REFERENCES menu_items(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

INSERT INTO categories (name) VALUES
('Drikkevarer'),
('Retter');

INSERT INTO menu_items (name, category_id, description_danish, description_english, price) VALUES
('Espresso', 1, 'En stærk og koncentreret kaffe', 'A strong and concentrated coffee', 20.00),
('Cappuccino', 1, 'Espresso med skumfidus og mælk', 'Espresso with marshmallow and milk', 30.00),
('Latte', 1, 'Espresso med meget mælk', 'Espresso with a lot of milk', 35.00),
('Americano', 1, 'Espresso med varmt vand', 'Espresso with hot water', 25.00),
('Te', 1, 'Sort te med citron', 'Black tea with lemon', 15.00),
('Soda', 1, 'Kold sodavand', 'Cold soda', 10.00),
('Juice', 1, 'Friskpresset juice', 'Freshly squeezed juice', 15.00),
('Vand', 1, 'Koldt vand', 'Cold water', 5.00),
('Chokolade', 1, 'Varme chokolade med flødeskum', 'Hot chocolate with whipped cream', 25.00),
('Iskaffe', 1, 'Kold kaffe med isterninger', 'Cold coffee with ice cubes', 30.00),
('Smoothie', 1, 'Frugt smoothie med yoghurt', 'Fruit smoothie with yogurt', 35.00),

('Kage', 2, 'Hjemmelavet chokolade kage', 'Homemade chocolate cake', 40.00),
('Sandwich', 2, 'Frisklavet sandwich med skinke og ost', 'Freshly made sandwich with ham and cheese', 50.00),
('Salat', 2, 'Grøn salat med dressing', 'Green salad with dressing', 30.00),
('Bagel', 2, 'Frisk bagel med cream cheese', 'Fresh bagel with cream cheese', 20.00),
('Croissant', 2, 'Lækker smør croissant', 'Delicious butter croissant', 15.00),
('Muffin', 2, 'Blød og saftig muffin', 'Soft and juicy muffin', 20.00),
('Brownie', 2, 'Chokolade brownie med nødder', 'Chocolate brownie with nuts', 25.00),
('Pasta', 2, 'Pasta med tomatsauce og parmesan', 'Pasta with tomato sauce and parmesan', 60.00),
('Pizza', 2, 'Pizza med pepperoni og ost', 'Pizza with pepperoni and cheese', 70.00),
('Burger', 2, 'Saftig burger med pomfritter', 'Juicy burger with fries', 80.00),
('Hotdog', 2, 'Klassisk hotdog med sennep og ketchup', 'Classic hotdog with mustard and ketchup', 40.00),
('Nachos', 2, 'Nachos med ost og salsa', 'Nachos with cheese and salsa', 50.00),
('Chili con Carne', 2, 'Krydret chili con carne med ris', 'Spicy chili con carne with rice', 65.00),
('Sushi', 2, 'Frisk sushi med laks og avocado', 'Fresh sushi with salmon and avocado', 90.00);