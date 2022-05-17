"use strict";

var mongoose = require("mongoose");
var app = require('./App')
const port = 3900;

mongoose.Promise = global.Promise;

mongoose
    .connect("mongodb://localhost:27017/api_rest_blog", { useNewUrlParser: true })
    .then(() => {
        console.log("Connected successfully!");

        // Crear servidor y escuchas de peticiones
        app.listen(port, () => {
            console.log('Server is running on http://localhost:' + port);
        })
    });