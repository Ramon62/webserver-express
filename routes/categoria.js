const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const Categoria = require('../models/categoria');

const app = express();

//Todas las categorias (no esta paginado)
app.get('/categoria', verificaToken, (req, res) => {
    Categoria
        .find({}, 'descripcion usuario')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                })
            }
            Categoria.countDocuments({}, (err, countDocuments) => {
                res.json({
                    ok: true,
                    categorias,
                    num: countDocuments
                })
            })

        })

})

//Mostrar una categoria por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Categoria
        .findById(id, (err, categoria) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                })
            }
            if (!id) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'La categoría no existe'
                    }
                })
            }
            res.json({
                ok: true,
                categoria
            })
        })

})

//Crear una categoría
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id, //Esto se obtiene del varificaToken
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(404).json({
                ok: false,
                err: {
                    message: 'Imposible crear categoría, por favor verifique campos sin completar.'
                }
            })
        }
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })



})

//actualizar categoria
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


//Borrar categoria
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    //Solo la puede eliminar un ADMIN
    let id = req.params.id;
    Categoria
        .findByIdAndRemove(id, (err, categoriaDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'Imposible borrar catagoria'
                    }
                })
            }
            if (!categoriaDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El id no existe'
                    }
                });
            }
            res.json({
                ok: true,
                //categoria: categoriaBorrada,
                message: 'Categoria borrada'

            })
        })

})


module.exports = app;