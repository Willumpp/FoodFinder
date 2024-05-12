var mysql = require("mysql2");

// Create database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "mysqluser",
    port: 3306,
    database: "food_finder",
    multipleStatements: true,
});



con.connect(function(err) {
    if (err) throw err;

    console.log("Connected Database");
});


// Reset the table
// Create the table
var sql = `
DROP TABLE IF EXISTS food_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS food;
DROP TABLE IF EXISTS restaurants;
CREATE TABLE restaurants (
    id INT,
    name TEXT,
    menu_link TEXT,
    rating FLOAT,
    subtext TEXT,
    PRIMARY KEY (id) 
);`
con.query(sql, function (err, result, field) {
    if (err) throw err;
});


// Reset the table
// Create the table
var sql = `
CREATE TABLE categories (
    id INT,
    category TEXT,
    PRIMARY KEY (id) 
);`
con.query(sql, function (err, result, field) {
    if (err) throw err;
});


// Reset the table
// Create the table
var sql = `
CREATE TABLE food (
    id INT,
    name TEXT,
    calories INT,
    price FLOAT,
    description TEXT,
    image_file INT,
    restaurant_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);`
con.query(sql, function (err, result, field) {
    if (err) throw err;
});


// Reset the table
// Create the table
var sql = `
CREATE TABLE food_categories (
    food_id INT,
    category_id INT,
    FOREIGN KEY (food_id) REFERENCES food(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);`
con.query(sql, function (err, result, field) {
    if (err) throw err;
});

sql = "SELECT * FROM food";

// Populate the table
// for (var i = 0; i < 10000; i++) {
//     sql += `
//     INSERT INTO food (name, price) VALUES (
//         '${i*2}',
//         ${i*2*7}
//     );`
// }

con.query(sql, function (err, result, field) {
    if (err) throw err;
});