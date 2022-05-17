"use strict";

// Cargar modulos de node para crear el servidor
var express = require("express");
var bodyParser = require("body-parser");

// Ejecutar express (http)
var app = express();

// Cargar ficheros rutas
var article_routes = require("./routes/article");

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); // cargar body-parser
app.use(bodyParser.json()); // convierte las peticiones en JSON

// Cargar CORS para las peticiones del front (victorroblesweb.es)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

// Añadir prefijos y cargar rutas
app.use("/api", article_routes);

// Ruta o metodo para comprobar el funcionamiento del API REST
// app.post('/datos-admin', (req, res) => {
//     var hola = req.body.hola
//     console.log('Hola Mundo!');
//     return res.status(200).send({
//         nombre: 'Jorge',
//         apellidos: 'Carrillo Escobar',
//         edad: 22,
//         genero: 'masculino',
//         hola
//     })
// })

// Exportar modulo (fichero actual)
module.exports = app;