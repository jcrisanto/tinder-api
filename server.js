const http = require("http");
const express = require("express");
const userRouter = require("./Routes/users.js");
const matchRouter = require("./Routes/matches.js")
const auth = require("./Services/auth");
const app = express();
app.use(express.json());
//authorize is used a middleware
app.use("/users", auth.authorize, userRouter);
app.use("/matches", auth.authorize, matchRouter);

const server = http.createServer(app);
const port = parseInt(process.env.PORT) || 3000;

server.listen(port, () => {
    console.log("Server listening on port " + port);
});