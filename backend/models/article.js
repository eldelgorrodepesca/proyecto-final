'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ArticleSchema = Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    image: String
})

// guarda este tipo de documentos con esta estructura dentro de la coleccions
module.exports = mongoose.model('Article', ArticleSchema)