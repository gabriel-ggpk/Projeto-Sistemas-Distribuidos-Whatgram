const mongoose = require('mongoose');
//exemplo
const clientSchema = new mongoose.Schema({
  name: String,
  email: String,

});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
//a ideia é criar um arquivo igual a este, só mudando o nome, para cada tipo de dado