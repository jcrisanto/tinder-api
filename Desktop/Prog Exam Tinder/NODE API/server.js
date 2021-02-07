const http = require("http");
const express = require("express");

const app = express();
app.use(express.json());
app.get("/hello", (req, res) => {
    res.status(200).json("Hello world");
});
const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening on port " + port);
});


