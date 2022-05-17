"use strict";

var validator = require("validator");
const article = require("../models/article");
var Article = require("../models/article");
const { param } = require("../routes/article");
var fs = require("fs");
var path = require("path");
const { exists } = require("../models/article");

var controller = {
    // Controlador
    datosUser: (req, res) => {
        var hola = req.body.hola;

        return res.status(200).send({
            nombre: "Jorge",
            apellidos: "Carrillo Escobar",
            edad: 22,
            genero: "masculino",
            hola,
        });
    },

    test: (req, res) => {
        // Testea el controlador
        return res.status(200).send({
            message: "Esta es la accion TEST del controlador de article",
        });
    },

    save: (req, res) => {
        // Recoge los params por POST
        var params = req.body;
        console.log(params);

        // Valida data
        try {
            var validate_title = !validator.isEmpty(params.title); // sera true cuando el titulo no este vacio
            var validate_content = !validator.isEmpty(params.content); // sera true cuando el contenido no este vacio
        } catch (err) {
            return res.status(200).send({
                // caso en el que falten datos
                status: "error",
                message: "Faltan datos por enviar",
            });
        }

        if (validate_title && validate_content) {
            // Crea el objeto a guardar
            var article = new Article();

            // Asigna valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            // Guarda el articulo
            article.save((err, articleStored) => {
                if (err || !articleStored) {
                    return res.status(404).send({
                        // caso en el que el articulo no se guarde
                        status: "error",
                        message: "El articulo no se ha guardado",
                    });
                } else {
                    // Devuelve una response
                    return res.status(200).send({
                        status: "success",
                        article,
                    });
                }
            });
        } else {
            return res.status(200).send({
                // caso en el que los datos no sean validos
                status: "error",
                message: "Los datos no son validos",
            });
        }
    },

    getArticles: (req, res) => {
        // Lista articulos comenzando por los mas recientes

        var query = Article.find({});
        var last = req.params.last;

        if (last || last != undefined) {
            query.limit(5);
        }

        query.sort("-_id").exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al devolver los articulos",
                });
            }

            if (!articles) {
                return res.status(404).send({
                    status: "error",
                    message: "No se han encontrado articulos",
                });
            }

            return res.status(200).send({
                status: "success",
                articles,
            });
        });
    },

    getArticle: (req, res) => {
        // List un solo articulo
        // Recoge el id de la URL
        var articleId = req.params.id;

        // Comprueba que el id existe
        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: "error",
                message: "No existe el articulo",
            });
        }

        // Busca el articulo segun su ID
        Article.findById(articleId, (err, article) => {
            if (err) {
                // Caso en que se produzca un error
                return res.status(500).send({
                    status: "error",
                    message: "Error al devolver los datos",
                });
            } else if (!article) {
                // Caso en que no exista el articulo
                return res.status(404).send({
                    status: "error",
                    message: "No existe el articulo",
                });
            } else {
                // Devuelve el JSON
                return res.status(404).send({
                    status: "success",
                    article,
                });
            }
        });
    },

    update: (req, res) => {
        // Recoge el ID del articulo por la URL
        var articleId = req.params.id;

        // Recoge data que llegan por PUT
        var params = req.body;

        // Valida data
        try {
            var validate_title = !validator.isEmpty(params.title); // Cuando el titulo no este vacio
            var validate_content = !validator.isEmpty(params.content); // Cuando el contenido no este vacio
        } catch (err) {
            return res.status(404).send({
                status: "error",
                message: "Faltan datos por enviar",
            });
        }

        if (validate_title && validate_content) {
            // Hace find y update
            Article.findOneAndUpdate({ _id: articleId },
                params, { new: true },
                (err, articleUpdated) => {
                    if (err) {
                        return res.status(500).send({
                            status: "error",
                            message: "Error al actualizar",
                        });
                    } else if (!articleUpdated) {
                        return res.status(404).send({
                            status: "error",
                            message: "No existe el articulo",
                        });
                    } else {
                        return res.status(200).send({
                            status: "success",
                            article: articleUpdated,
                        });
                    }
                }
            );
        } else {
            return res.status(200).send({
                status: "error",
                message: "La validacion no es correcta",
            });
        }
    },

    delete: (req, res) => {
        // Recoge el ID de la URL
        var articleId = req.params.id;

        // Find and delete
        Article.findOneAndDelete({ _id: articleId }, (err, articleRemoved) => {
            if (err) {
                // Caso en que haya un problema al borrar
                return res.status(500).send({
                    status: "error",
                    message: "Error al borrar",
                });
            } else if (!articleRemoved) {
                // Caso en que el articulo no llegue
                return res.status(404).send({
                    status: "error",
                    message: "No se ha podido borrar, posiblemente no exista",
                });
            } else {
                return res.status(200).send({
                    status: "success",
                    article: articleRemoved,
                });
            }
        });
    },

    upload: (req, res) => {
        // Recoge el fichero de la peticion
        var file_name = "Imagen no subida...";

        if (!req.files) {
            return res.status(404).send({
                status: "error",
                message: file_name,
            });
        }

        // Recoge el nombre y la extension
        var file_path = req.files.file0.path;
        var file_split = file_path.split("\\");

        var file_name = file_split[2]; // Nombre del archivo

        // Extension del fichero
        var extension_split = file_name.split(".");
        var file_ext = extension_split[1]; // Nombre de la extension
        var valid_extension = ["png", "jpg", "jpeg", 'gif'].includes(file_ext)
            // Comprueba la extension (solo imagenes)
        if (!valid_extension) {
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: "error",
                    message: "La extension del archivo no es valida",
                });
            });
        } else {
            var articleId = req.params.id;
            // Busca el articulo, asigna el nombre y lo actualiza
            Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true },
                (err, articleUpdated) => {
                    if (err || !articleUpdated) {
                        return res.status(200).send({
                            status: "error",
                            message: "Error al guardar la imagen del articulo",
                        });
                    }

                    return res.status(200).send({
                        status: "success",
                        article: articleUpdated,
                    });
                }
            );
        }
    },

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = "./upload/articles/" + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe",
                });
            }
        });
    },

    search: (req, res) => {
        // Saca el String que va a buscar
        var searchString = req.params.search;

        // Find "$or"
        Article.find({
                $or: [
                    // Si el searchString esta incluido en el titulo o en el content, sacara articulos que coincidan
                    { title: { $regex: searchString, $options: "i" } },
                    { content: { $regex: searchString, $options: "i" } },
                ],
            })
            .sort([
                // Se muestran ordenadas de forma descendente
                ["date", "descending"],
            ])
            .exec((err, articles) => {
                // Ejecuta la consulta
                if (err) {
                    // En caso de que ocurra un error
                    return res.status(500).send({
                        status: "error",
                        message: "Hubo un error en la peticion",
                    });
                } else if (!articles || articles.length <= 0) {
                    // En caso de que no haya articulos que coincidan
                    return res.status(404).send({
                        status: "error",
                        message: "No hay articulos que coincidan con la busqueda",
                    });
                } else {
                    return res.status(200).send({
                        status: "success",
                        articles: articles,
                    });
                }
            });
    },
}; // end controller

module.exports = controller;