const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser')

require('./config/config');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//Configuracion global de rutas
app.use(require('./routes/index'));

//Configuracion de la base de datos
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err, res) => {
    if (err) throw err;
    console.log("Base de datos ONLINE");
});

app.listen(process.env.PORT, () => {
    console.log("Escuchando en el puerto: ", process.env.PORT);
})

//mongodb+srv://ramon:bG5xvxjbE0k1xmrH@cluster0.iwh16.mongodb.net/test