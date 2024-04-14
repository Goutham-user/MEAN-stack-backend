
const express = require('express');
let cors = require("cors");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const postRoutes = require('./routes/post-routes');

const userRoutes = require('./routes/user');
const Post = require('./models/posts');
const path = require('path');
require('dotenv').config();
const config = require('./config/config')
// require('dotenv').config({path: path.resolve(__dirname+'/.env')});



// const multer = require('multer');
// const { google } = require('googleapis');
// const fs = require('fs');
// const checkAuth2 = require('./middlewares/check-auth')

const app = express();
const PORT = config.environmentVariables.PORT;
const MogodbConnectionString = config.environmentVariables.MogodbConnectionString;

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
