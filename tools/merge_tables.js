var mysql = require("mysql2");
var sqlite3 = require("sqlite3").verbose();

let sqlite3Con = new sqlite3.Database("tools/food_finder.db");

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

function simplify(string) {
    out = "";

    if (string == "") return "NULL";

    string = `${string}`;
    for (let i = 0; i < string.length; i++) {
        let ascii = string.charCodeAt(i);
        let blacklist = `()"',`

        // if ((65 <= ascii && ascii <= 90) // Capitals
        //     || (97 <= ascii && ascii <= 122) // Lowercase
        //     || (48 <= ascii && ascii <= 57) // Numbers
        //     || (32 == ascii) // Spacebar
        //     || string[i] == "." || string[i] == ":" || string[i] == "/") 
        if (blacklist.includes(string[i]) == false)
        { out += string[i]; }
    }

    return out;
}

function replaceNull(string) {
    if (string == "") return null
    else return string;
}

function insertCategories() {
    return new Promise((resolve, rej) => {
        // Merge categories
        var sql = `
        SET FOREIGN_KEY_CHECKS = 0;
        TRUNCATE TABLE restaurants;
        TRUNCATE TABLE food;
        TRUNCATE TABLE categories; 
        TRUNCATE TABLE food_categories;
        SET FOREIGN_KEY_CHECKS = 1;
        INSERT INTO categories (id, category) VALUES ?`

        sqlite3Con.all("SELECT * FROM categories;", [], (err, rows) => {
            if (err) throw err;
            console.log(rows.length);

            values = []
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i];
                values.push([row["category_id"], `${row["category_name"]}`]);
            }
            
            con.query(sql, [values], function(err, res, fields) {
                if (err) throw (err);
                console.log("Completed categories query");

                return resolve(1);
            });
        });
    })
}

function insertRestaurants() {
    return new Promise((resolve, rej)=> {
        // Merge restaurants
        var sql = `INSERT INTO restaurants (id, name, menu_link, rating, subtext) VALUES ?`
        sqlite3Con.all("SELECT * FROM restaurants;", [], (err, rows) => {
            if (err) throw err;
            console.log(rows.length);

            values = []
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i];

                values.push([
                    replaceNull(row["restaurant_id"]), 
                    replaceNull(row["name"]), 
                    replaceNull(row["menu_link"]), 
                    replaceNull(row["rating"]), 
                    replaceNull(row["subtext"]),
                ]);
            }
            
            con.query(sql, [values], function(err, res, fields) {
                if (err) throw (err);
                console.log("Completed restaurant query");

                return resolve(1);
            });
        });
    });
}

function insertFood() {
    return new Promise((resolve, rej) => {
        // Merge food items
        var sql = `INSERT INTO food (id, name, calories, price, description, image_file, restaurant_id) VALUES ?`
        sqlite3Con.all("SELECT * FROM food_items;", [], (err, rows) => {
            if (err) throw err;
            console.log(rows.length);

            values = []
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i];

                values.push([
                    replaceNull(row["food_id"]), 
                    replaceNull(row["name"]), 
                    replaceNull(row["calories"]), 
                    replaceNull(String(row["price"]).replace(",", "")), 
                    replaceNull(row["description"]),
                    replaceNull(row["image_file"]),
                    replaceNull(row["restaurant_id"]),
                ]);
            }
            
            con.query(sql, [values], function(err, res, fields) {
                if (err) throw (err);
                console.log("Completed food query");

                return resolve(1);
            });
        });
    });
}

function insertFoodCategories() {
    return new Promise((resolve, rej) => {
        // Merge food categories
        var sql = `INSERT INTO food_categories (food_id, category_id) VALUES ?`
        sqlite3Con.all("SELECT * FROM food_categories;", [], (err, rows) => {
            if (err) throw err;
            console.log(rows.length);

            values = []
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i];

                values.push([
                    replaceNull(row["food_id"]), 
                    replaceNull(row["category_id"]), 
                ]);
            }
            
            con.query(sql, [values], function(err, res, fields) {
                if (err) throw (err);
                console.log("Completed food categories query");

                return resolve(1);
            });
        });
    });
}

async function insertValues() {
    await insertCategories();
    await insertRestaurants();
    await insertFood();
    await insertFoodCategories();
}

insertValues();