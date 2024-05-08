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
DROP TABLE IF EXISTS food;
CREATE TABLE food (
    id INT PRIMARY KEY,
    name TEXT,
    calories INT,
    price FLOAT,
    description TEXT,
    image_file INT,
    restaurant_id INT
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