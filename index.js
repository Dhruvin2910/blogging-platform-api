const express = require("express");
const app = express();
const dotenv = require("dotenv");
const PORT = 8000;

//Load exnvironment from variables files
dotenv.config();

//connect with mongoDB
require("./Config/db");

app.listen(PORT, () => {
    console.log(`Listining to Port ${PORT}`);
})

app.get("/test", (req, res) => {
    res.write("Welcome to Nodejs server");
    res.send();
})