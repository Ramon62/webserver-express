const express = require('express');
const fileUpload = require('express-fileupload');
const uuid = require('uuid-random');
const app = express();
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

//default options
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No files were uploaded.'
            }
        });
    }

    //validad tipo
    let tipoValido = ['producto', 'usuarios'];
    if (tipoValido.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: true,
            err: {
                message: 'Los tipos permitidos son: ' + tipoValido.join(', ')
            }
        })
    }

    let archivo = req.files.archivo;


    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                mesage: 'La extension no esta permitida: ' + extensionesValidas.join(', ')
            }
        })
    }

    //cambiar nombre del archivo
    let nombreArchivo = uuid() + '.' + extension;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        //Aqui esta cargada la imagen
        if (tipo == 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });

})

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!usuarioBD) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }
        borrarArchivo(usuarioBD.img, 'usuarios');
        usuarioBD.img = nombreArchivo;
        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {
    Producto
        .findById(id, (err, productoBD) => {
            if (err) {
                borrarArchivo(nombreArchivo, 'productos');
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            if (!productoBD) {
                borrarArchivo(nombreArchivo, 'productos');
                res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                })
            }
            borrarArchivo(productoBD.img, 'productos');
            productoBD.img = nombreArchivo;
            productoBD.save((err, productoGuardado) => {
                res.json({
                    ok: true,
                    producto: productoGuardado,
                    img: nombreArchivo
                })
            })
        })
}

function borrarArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;