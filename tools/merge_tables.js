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

// Merge categories
var sql = `
    SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE restaurants;
    TRUNCATE TABLE food;
    TRUNCATE TABLE categories; 
    TRUNCATE TABLE food_categories;
    SET FOREIGN_KEY_CHECKS = 1;
    INSERT INTO categories (id, category) VALUES `
sqlite3Con.all("SELECT * FROM categories;", [], (err, rows) => {
    if (err) throw err;
    console.log(rows.length);

    let subquery = "";
    for (var i = 0; i < rows.length; i++) {
        let row = rows[i];

        let subquery = `(${row["category_id"]}, '${simplify(row["category_name"])}'),\n`
        sql += subquery;
    }
    sql = sql.substring(0, sql.length-3);
    sql += ");"
    
    con.query(sql, function(err, res, fields) {
        if (err) throw (err);
        console.log("Completed query");

        // Merge restaurants
        var sql = `INSERT INTO restaurants (id, name, menu_link, rating, subtext) VALUES `
        sqlite3Con.all("SELECT * FROM restaurants;", [], (err, rows) => {
            if (err) throw err;
            console.log(rows.length);
        
            let subquery = "";
            for (var i = 0; i < rows.length; i++) {
                let row = rows[i];
        
                let subquery = `(${row["restaurant_id"]}, '${simplify(row["name"])}', '${simplify(row["menu_link"])}', ${simplify(row["rating"])}, '${simplify(row["subtext"])}'),\n`
                sql += subquery;
            }
            sql = sql.substring(0, sql.length-3);
            sql += ");"
            
            con.query(sql, function(err, res, fields) {
                if (err) throw (err);
                console.log("Completed query");


                // Merge food items
                var sql = `INSERT INTO food (id, name, calories, price, description, image_file, restaurant_id) VALUES `
                sqlite3Con.all("SELECT * FROM food_items;", [], (err, rows) => {
                    if (err) throw err;
                    console.log(rows.length);
                
                    let subquery = "";
                    for (var i = 0; i < rows.length; i++) {
                        let row = rows[i];
                
                        let subquery = `(${row["food_id"]}, '${simplify(row["name"])}', ${simplify(row["calories"])}, ${simplify(row["price"])}, '${simplify(row["description"])}', ${row["image_file"]}, ${row["restaurant_id"]}),\n`
                        sql += subquery;
                    }
                    sql = sql.substring(0, sql.length-3);
                    sql += ");"
                    
                    con.query(sql, function(err, res, fields) {
                        if (err) throw (err);
                        console.log("Completed query");

                        // Merge food categories
                        var sql = `INSERT INTO food_categories (food_id, category_id) VALUES `
                        sqlite3Con.all("SELECT * FROM food_categories;", [], (err, rows) => {
                            if (err) throw err;
                            console.log(rows.length);
                        
                            let subquery = "";
                            for (var i = 0; i < rows.length; i++) {
                                let row = rows[i];
                        
                                let subquery = `(${row["food_id"]}, ${row["category_id"]}),\n`
                                sql += subquery;
                            }
                            sql = sql.substring(0, sql.length-3);
                            sql += ");"
                            
                            con.query(sql, function(err, res, fields) {
                                sqlite3Con.close();
                                
                                if (err) throw (err);
                                console.log("Completed query");
                                
                            });
                        });
                    });
                });
            });
        });
    });
});




