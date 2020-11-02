//==============
//Verificar Token
//===============
const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(404).json({
                ok: false,
                err
            })
        }
        req.usuario = decoded.usuario;
        next();
    })

};

//==============
//Verificar Admin ROLE
//===============
let verificaAdminRole = (req, res, next) => {
    let usuario = req.usuario;
    let role = usuario.role;
    if (role !== 'ADMIN_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no tiene credenciales'
            }
        })
    }
    next();
}

module.exports = {
    verificaToken,
    verificaAdminRole
}