const express = require("express");
const app = express();
const dotenv = require("dotenv");
const authRoute = require("./Routes/Auth");
const userRoute = require("./Routes/User");
const postRoute = require("./Routes/Post");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 8000;

//Load exnvironment from variables files
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser()); 

//connect with mongoDB
require("./Config/db");

app.listen(PORT, () => {
    console.log(`Listining to Port ${PORT}`);
})


//Routes
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/post", postRoute);

//for server testing
app.get("/test", (req, res) => {
    res.write("Welcome to Nodejs server");
    res.send();
})