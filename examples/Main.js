var mysql = require("mysql2");
var fs = require("fs");
var http = require("http");
var url = require("url");

var con = mysql.createConnection({
    host: "localhost",
    user: "mysqluser",
    port: 3306,
    database: "weather",
});

con.connect(function(err) {
    if (err) throw err;

    console.log("Connected Database");
});


const server = http.createServer(function (req, res) {
    // 200: status code "okay"
    // {}: response headers
    
    var inputURL = url.parse(req.url, true); //Get the url information
    var inputQuery =  inputURL.query; // Convert to dictionary of get query
    var inputState = inputQuery["state_field"]; //state_field : name of input html element
    
    // Check if querying the database with URL
    if (inputURL.pathname != "/query_database/") {
        res.writeHead(200, {'Content-Type': 'text/html'});

        // Read HTML file and send
        fs.readFile("./FrontPage.html", function(err, data) {
            res.write(data);
            res.end(); // End needs to be in readFile otherwise response is sent before file is read
        });
    }
    else {
        // Query database using state name
        // Send a response with JSON
        res.writeHead(200, {'Content-Type': 'application/json'});

        var sql = `SELECT * FROM temperature WHERE state='${inputState}' ORDER BY id;`
        con.query(sql, function(err, result, fields) {
            if (err) throw err;
            res.write(JSON.stringify(result));
            res.end();
        });

    };
}); 

server.listen(8080, function() {
    console.log("Now listening on port 8080");
});
