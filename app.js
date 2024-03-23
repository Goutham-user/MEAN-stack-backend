
const express = require('express');
let cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post-routes');

const userRoutes = require('./routes/user');

const path = require('path');
require('dotenv').config({path: path.resolve(__dirname+'/.env')});

const app = express();
const PORT = 3000;
const MogodbConnectionString = `mongodb+srv://user1:GhBeqkOyelWQ6hbK@cluster0.kdjlb.mongodb.net/zomato_clone_DB?retryWrites=true&w=majority&appName=Cluster0`

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);

app.use("/images", express.static(path.join("images")));

mongoose.connect(MogodbConnectionString).then(()=>{
    console.log('Database is connected succesfully!')
}).catch(()=>{
    console.log('Connection Failed')
})


app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, and route is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
});


// app.use((req, res, next)=>{
//     res.setHeader("Acess-Control-Allow-Origin", "*");
//     res.setHeader("Acess-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     res.setHeader("Acess-Control-Allow-Methods", " GET, POST, PATCH, DELETE, OPTIONS");
//     next();
// })