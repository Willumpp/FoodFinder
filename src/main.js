var fs = require("fs");
var http = require("http");
const path = require("path");
var url = require("url");


/**
 * Writes HTML document to response and sends it back to clinet
 * @param {http.ServerResponse<http.IncomingMessage>} res Response to send back to client
 * @param {String} path Path to HTML document to send
 */
function sendFile(res, filePath) {
    const contentType = "text/"+path.extname(filePath).replace(".", ""); // Parse the content type using file extension
    res.writeHead(200, {'Content-Type': contentType});

    // Note: readFile is asynchronous
    fs.readFile(filePath, function(err, data) {
        if (err) throw err;

        res.write(data);
        res.end();
    });

}

const server = http.createServer(function (req, res) {

    const urlParsed = url.parse(req.url, res);
    const urlPath = urlParsed.pathname; // This is the url path of the request (INC. files)

    
    // If specific file requested
    if (path.extname(urlPath)) {
        let newPath = "./src/frontend"+urlPath; // This is probably really unsecure!
        console.log(`Requested file: '${newPath}'`);

        // Check if the file exists
        // If not do not send response
        // Note: this does not work?
        if (fs.existsSync(newPath) == false) { 
            console.log(`Failed request: File '${newPath}' does not exist!`); 
            return; 
        };

        sendFile(res, newPath);
        return;
    }

    // Send front page to user
    console.log(`Requested index.html`);
    sendFile(res, "./src/frontend/index.html");
}); 

server.listen(8080, function() {
    console.log("Now listening on port 8080");
});
