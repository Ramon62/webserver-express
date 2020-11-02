const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//==============
//Todos los productos
//===============
app.get('/productos', verificaToken, (req, res) => {
    //todos los productos
    //Popular:usuario, categoria
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto
        .find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario')
        .populate('categoria')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            Producto.countDocuments((err, count) => {
                res.json({
                    ok: true,
                    producto,
                    cantidad: count
                })
            })
        })
});

//==============
//Un producto por ID
//===============
app.get('/productos/:id', verificaToken, (req, res) => {
    //Popular:usuario, categoria
    //paginado
    let id = req.params.id;
    Producto
        .findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, producto) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Error en la busqueda'
                    }
                })
            }
            if (!producto) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                })
            }
            res.json({
                ok: true,
                producto
            })

        })
});
//==============
//Buscar un producto
//===============
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.json({
                ok: true,
                productos
            })
        })
})


//==============
//Crear un producto
//===============
app.post('/productos', verificaToken, (req, res) => {
    //Obtener el usuario
    //obtener la categoria
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    producto
        .save((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            res.status(201).json({
                ok: true,
                producto: productoDB
            })
        })
});

//==============
//Actualiza un producto
//===============
app.put('/productos/:id', verificaToken, (req, res) => {
    //Obtener el usuario
    //obtener la categoria
    let id = req.params.id;
    let body = req.body;

    let producto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    }

    Producto
        .findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: true,
                    err
                })
            }
            if (!productoDB) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'El producto no se encuentra'
                    }
                })
            }
            res.json({
                ok: true,
                productoDB
            })
        })
});

//==============
//Borrar un producto
//===============
app.delete('/productos/:id', verificaToken, (req, res) => {
    //NO BORRAR, solo que no esté disponible
    //Obtener el usuario
    //obtener la categoria
    let id = req.params.id;
    let estado = {
        disponible: false
    }
    Producto
        .findByIdAndUpdate(id, estado, { new: true, runValidators: true }, (err, productoBorrado) => {
            if (err) {
                return res.status(400).json({
                    ok: true,
                    err
                })
            }
            if (!productoBorrado) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'El producto no se encuentra'
                    }
                })
            }
            res.json({
                ok: true,
                productoBorrado,
                mensaje: 'Producto borrado'
            })
        })

});





module.exports = app;