const http = require("http");
const express = require("express");
const userRouter = require("./Routes/users.js");
const app = express();
app.use(express.json());
app.use("/users", userRouter);

const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening on port " + port);
});