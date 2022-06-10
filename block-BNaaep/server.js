var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
let server = http.createServer(handleRequest);


function handleRequest(req, res) {
    let store = "";
    let parsedUrl = url.parse(req.url, true);

    req.on("data", (chunk) => {
        store += chunk;
    });

    req.on("end", () => {
        let contactPath = path.join(__dirname + "/contacts/");
        // handling the /route here
        if (req.method === "GET" && req.url === "/") {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream("./index.html").pipe(res);
        }
        // handling the /about route
        if (req.method === "GET" && req.url === "/about") {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream("./about.html").pipe(res);
        }
        // handling the /contact route here
        if (req.method === "GET" && req.url === "/contact") {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream("./contact.html").pipe(res);
        }
        // handling the /contact Route if the method is post
        if (req.method === "POST" && req.url === "/contact") {
            let parsedData = qs.parse(store);
            let stringifiedData = JSON.stringify(parsedData);
            if (parsedData.username === "") {
                return res.end("username can not be empty");
            }
            fs.open(contactPath + parsedData.username + ".json", "wx", (err, fd) => {
            if (err) {
                res.setHeader("Content-Type", "text/html");
                return res.end("<h1>username already Exists</h1>");
            }
            fs.write(fd, stringifiedData, (err) => {
                fs.close(fd, (err) => {
                    res.setHeader("Content-Type", "text/html");
                    res.write(`<h1>${parsedData.username} contact saved </h1>`);
                    res.end();
                });
            });
        });
    }
    // handle GET request on `/users?username=ANY_USERNAME_FROM_CONTACTS` which should
    if (req.method === "GET" && parsedUrl.pathname === "/users") {
      // this part only runs if  query in the url includes  the  username property
        if (parsedUrl.query.username) {
            let userFileName = path.join(
            contactPath + parsedUrl.query.username + ".json"
            );
        fs.readFile(userFileName, "utf8", (err, content) => {
            res.setHeader("Content-Type", "application/json");
            return res.end(content);
        });
        }
    }
    //Handling with the  css request
    if (req.method === "GET" && req.url.split(".").pop() === "css") {
        const cssFile = req.url;
        res.setHeader("Content-Type", "text/css");
        fs.readFile(__dirname + cssFile, "utf8", (err, content) => {
        res.end(content);
        });
    }
    // Handling with the images requests
    if (req.method === "GET" && req.url.split(".").pop() === "jpg") {
        const imageUrl = req.url;
        res.setHeader("Content-Type", "image/jpg");
        fs.createReadStream(__dirname + req.url).pipe(res);
    }
    });
}

server.listen(5000, ()=>{
    console.log("server listening on port 5000");
})