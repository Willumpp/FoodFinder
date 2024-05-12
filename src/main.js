var fs = require("fs");
var http = require("http");
const path = require("path");
var url = require("url");
var mysql = require("mysql2");

// Create database connection
var con = mysql.createConnection({
    host: "localhost",
    user: "mysqluser",
    port: 3306,
    database: "food_finder",
    multipleStatements: true,
});


const PORT = 8080;

/**
 * Checks if given element is within the array
 * @param {Iterable} array Array to check through
 * @param {*} element Element in array to check for
 * @returns True if element in array, otherwise false
 */
function isIn(array, element) {
    let found = false;
    
    // !Remember! : cannot "break;" or "return;" from forEach loop!!
    array.forEach(arrayElement => {
        if (arrayElement == element ) { found = true; }
    });

    return found;
}


/**
 * Writes HTML document to response and sends it back to clinet
 * @param {http.ServerResponse<http.IncomingMessage>} res Response to send back to client
 * @param {String} path Path to HTML document to send
 */
function sendFile(res, filePath) {
    const contentType = "text/"+path.extname(filePath).replace(".", ""); // Parse the content type using file extension
    res.writeHead(200, {'Content-Type': contentType});

    console.log(`    background-color: darkgrey;
    Serving file: '${filePath}'`);

    // Note: readFile is asynchronous
    fs.readFile(filePath, function(err, data) {
        if (err) throw err;

        res.write(data);
        res.end();
        console.log(`Sent response file: '${filePath}'`);
    });

}


function sendQuery(res, htmlQuery) {
    res.writeHead(200, {'Content-Type':'application/json'});

    let htmlKeys = Object.keys(htmlQuery);

    console.log(`Querying with: ${JSON.stringify(htmlQuery)}`);
    
    let sqlQuery = "";
    for (let i = 0; i < htmlKeys.length; i++) {
        let key = htmlKeys[i];


        // Decide what to do with the query
        switch (key) {
            case "query":
                let query = "";

                if (htmlQuery["query"] instanceof Array) {
                    htmlQuery["query"].forEach((food) => { query += `${food} `});
                    query = query.substring(0, query.length-1);
                }
                else {
                    query = htmlQuery["query"];
                }
                console.log(`Query: '${query}'`);
                query = query.split(/ +/);
                console.log("Query: ", query);

                // let query = htmlQuery["query"].split(" ");
                let whereStatement = "";
                
                // Whithout having count, anything with 1 matching tag from WHERE clause is displayed
                let havingCount = query.length; // Needed for filtering out all food items with insufficient number of matching tags

                // Use WHERE <field> IN (item1, item2, ...) clause
                whereStatement = "c.category IN ("
                query.forEach((food) => { whereStatement += `'${food}', `;});
                whereStatement = whereStatement.substring(0, whereStatement.length - 2) + ")";
                
                console.log(`Where statement: '${whereStatement}'`);
                sqlQuery += `
                    SELECT f.id, f.name, f.price, r.menu_link FROM food f
                    JOIN food_categories fc ON f.id=fc.food_id
                    JOIN categories c ON fc.category_id=c.id
                    JOIN restaurants r ON f.restaurant_id=r.id
                    WHERE ${whereStatement}
                    GROUP BY f.id
                    HAVING COUNT(DISTINCT c.category) = ${havingCount}
                    ORDER BY f.price;`;
                break;
        
            default:
                break;
        }
    }

    if (htmlKeys.length == 0) { sqlQuery = "SELECT * FROM food;"; }
    
    console.log(`Querying with: '${sqlQuery}'`);
    con.query(sqlQuery, function(err, result, fields) {
        if (err) throw err;
        
        res.write(JSON.stringify(result));
        res.end();
    })
}

// Directory of actions to perform given the URL path
const responseDirectories = {
    // Send front page if no directory
    "/" : function(req, res) {
        sendFile(res, "./src/frontend/index.html");
    },

    // Send search result page
    "/search/" : function(req, res) {
        sendFile(res, "./src/frontend/search.html");
    },

    // DB queries
    "/db/" : function(req, res) {
        const urlParsed = url.parse(req.url, true);
        const query = urlParsed.query;

        sendQuery(res, query);
    },

    // Not found
    "/notfound/" : function(req, res) {
        console.log("Request URL not found in directory");
        sendFile(res, "./src/frontend/error.html");
    }
}

const server = http.createServer(function (req, res) {
    console.log("");
    const urlParsed = url.parse(req.url, res);
    const urlPath = urlParsed.pathname; // This is the url path of the request (INC. files)
    console.log(`Requested URL: '${urlPath}'`);

    
    // If specific file requested
    if (path.extname(urlPath)) {
        let newPath = "./src/frontend"+urlPath; // This is probably really unsecure!
    
        sendFile(res, newPath);
        return;
    }

    // Respond to given url
    // If url is not in directory
    if (isIn(Object.keys(responseDirectories), urlPath) == false) {
        responseDirectories["/notfound/"](req, res);
        return;
    }

    // Call respective function for URL
    responseDirectories[urlPath](req, res);
    
}); 

server.listen(PORT, function() {
    console.log("Now listening on port "+PORT);
});
