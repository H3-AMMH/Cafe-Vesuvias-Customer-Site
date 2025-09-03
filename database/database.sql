CREATE TABLE tables (
    id INTEGER PRIMARY KEY,
    table_number INTEGER NOT NULL
);

CREATE TABLE reservations (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    table_id INTEGER NOT NULL,
    time DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES online_customers(id),
    FOREIGN KEY (table_id) REFERENCES tables(id)
);

CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    description_danish TEXT NOT NULL,
    description_english TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE item_ingredients (
    id INTEGER PRIMARY KEY,
    item_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    FOREIGN KEY (item_id) REFERENCES menu_items(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);


INSERT INTO categories (id, name) VALUES
(1, 'Food'),
(2, 'Drinks');

INSERT INTO menu_items (id, name, category_id, description_danish, description_english, price) VALUES
-- Food
(1, 'Nachos Supreme', 1, 
 'Varme tortillachips med crispy kylling, jalapeños, gratineret med ost, serveres med salsa, guacamole og creme fraiche',
 'Warm tortilla chips with crispy chicken, jalapeños, melted cheese, served with salsa, guacamole and sour cream', 
 129.00),
(2, 'Cæsar Salat', 1, 
 'Stegt kyllingebryst, hjertesalat vendt med cæsardressing, parmesanflager og croutoner.',
 'Grilled chicken breast, romaine lettuce tossed with Caesar dressing, parmesan flakes and croutons.', 
 139.00),
(3, 'Tigerrejesalat', 1,
 'Stegte tigerrejer med kålsalat, avocado, nudler, agurk, gulerod, edamame bønner, mynte, cashewnødder og gomadressing',
 'Grilled tiger prawns with cabbage salad, avocado, noodles, cucumber, carrot, edamame beans, mint, cashews and goma dressing', 
 139.00),
(4, 'Vegetar Salat', 1,
 'Sweet potato, falafel, babyspinat, granatæble, bulgur, feta, tomater, edamame bønner, hjemmelavet basilikumpesto, græskarkerner og mynte',
 'Sweet potato, falafel, baby spinach, pomegranate, bulgur, feta, tomatoes, edamame beans, homemade basil pesto, pumpkin seeds and mint', 
 119.00),
(5, 'Club Sandwich', 1,
 'Stegt kyllingebryst, sprød bacon, karrymayonnaise, tomat og salat. Serveres med pommes frites og mayonnaise',
 'Grilled chicken breast, crispy bacon, curry mayonnaise, tomato and lettuce. Served with French fries and mayonnaise', 
 139.00),
(6, 'Laksesandwich', 1,
 'Sandwich med røget laks, hjemmelavet basilikumspesto, salat, avocado og syltet rødløg. Serveres med pommes frites og mayonnaise',
 'Sandwich with smoked salmon, homemade basil pesto, lettuce, avocado and pickled red onion. Served with French fries and mayonnaise', 
 149.00),
(7, 'Spicy Steak Sandwich', 1,
 'Sandwich med oksestrimler, salat, guacamole, jalapeños, syltede rødløg og spicy chilimayonnaise. Serveres med pommes frites og chilimayonnaise.',
 'Sandwich with beef strips, lettuce, guacamole, jalapeños, pickled red onion and spicy chili mayonnaise. Served with French fries and chili mayonnaise', 
 149.00),
(8, 'Tunsandwich', 1,
 'Sandwich med tunmoussé, salat, avocado, syltede rødløg og hjemmelavet basilikumpesto. Serveres med pommes frites og mayonnaise.',
 'Sandwich with tuna mousse, lettuce, avocado, pickled red onion and homemade basil pesto. Served with French fries and mayonnaise', 
 139.00),
(9, 'Vesuvius Burger', 1,
 'Bøf af hakket oksekød i briochebolle med salat, pickles, tomat, syltede rødløg og burgerdressing. Serveres med pommes frites og mayonnaise.',
 'Beef patty in brioche bun with lettuce, pickles, tomato, pickled red onion and burger dressing. Served with French fries and mayonnaise', 
 149.00),
(10, 'Spicy Burger', 1,
 'Bøf af hakket oksekød i briochebolle med salat, tomat, jalapeños, syltede rødløg og chilimayonnaise. Serveres med pommes frites og chilimayonnaise',
 'Beef patty in brioche bun with lettuce, tomato, jalapeños, pickled red onion and chili mayonnaise. Served with French fries and chili mayonnaise', 
 149.00),
(11, 'Crispy Chicken Burger', 1,
 'Sprød kylling i briochebolle med salat, tomat, syltede rødløg, chilimayonnaise, jalapeños og guacamole. Serveres med pommes frites og mayonnaise',
 'Crispy chicken in brioche bun with lettuce, tomato, pickled red onion, chili mayonnaise, jalapeños and guacamole. Served with French fries and mayonnaise', 
 149.00),
(12, 'Tomatsuppe', 1,
 'Tomatsuppe med creme fraiche og frisk basilikum. Serveres med brød og smør',
 'Tomato soup with sour cream and fresh basil. Served with bread and butter', 
 99.00),
(13, 'Pasta med Kylling', 1,
 'Pasta med kylling, blandede svampe og parmesan.',
 'Pasta with chicken, mixed mushrooms and parmesan.', 
 169.00),
(14, 'Pasta med Oksemørbrad', 1,
 'Pasta med grilllet oksemørbrad, blandede svampe og parmesan.',
 'Pasta with grilled beef tenderloin, mixed mushrooms and parmesan.', 
 179.00),
(15, 'Pasta med Tigerrejer', 1,
 'Pasta med tigerrejer, tomatsauce, parmesan og basilikum',
 'Pasta with tiger prawns, tomato sauce, parmesan and basil', 
 179.00),

-- Drinks
(16, 'Aperol Spritz', 2,
 'Aperol, prosecco, danskvand, appelsinskive. Klassiskeren til en varm sommerdag. Eller bare fordi...',
 'Aperol, prosecco, soda water, orange slice. A classic for a hot summer day—or just because...', 
 85.00),
(17, 'Espresso Martini', 2,
 'Vodka/tequila, kahlua, espresso, vanilje. En klassiker med et twist, vælg mellem vodka eller tequila.',
 'Vodka/tequila, kahlua, espresso, vanilla. A classic with a twist—choose between vodka or tequila.', 
 85.00),
(18, 'Dark n Stormy', 2,
 'Mørk rom, gingerbeer, friskpresset limesat og gomme sirup.',
 'Dark rum, ginger beer, fresh lime juice and gomme syrup.', 
 85.00),
(19, 'Mojito', 2,
 'Rom, mynte, rørsukker, friskpresset limesaft, limeskiver.',
 'Rum, mint, cane sugar, fresh lime juice, lime slices.', 
 85.00),
(20, 'Gin Tonic', 2,
 'Gin, tonic, citronskive.',
 'Gin, tonic, lemon slice.', 
 85.00),
(21, 'Moscow Mule', 2,
 'Vodka, friskpresset limesaft, gingerbeer.',
 'Vodka, fresh lime juice, ginger beer.', 
 85.00),
(22, 'Strawberry Daquiri', 2,
 'Lys rom, jordbær, friskpresset lime, gomme sirup.',
 'Light rum, strawberries, fresh lime juice, gomme syrup.', 
 85.00),
(23, 'Gin Hass', 2,
 'Gin, mangojuice, frisk lime og lemon.',
 'Gin, mango juice, fresh lime and lemon soda.', 
 85.00);
