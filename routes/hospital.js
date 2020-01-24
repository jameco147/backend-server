var express = require('express');
var bcrypt = require('../node_modules/bcrypt');

var mdAuthentication = require('../middlewares/authentication');

var app = express();

var Hospital = require('../models/hospital');



// =========================================================
// Obtener todos los hospitales
//==========================================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en base de datos',
                        errors: err
                    });
                }

                Hospital.count({}, (error, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                })
            })
});


// =========================================================
// Actualizar hospital
//==========================================================
app.put('/:id', mdAuthentication.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id' + id + ' no existe',
                errors: { message: 'No existe un usuario cono ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    })
});





// =========================================================
// Crear un nuevo hospital
//==========================================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });
})

// =========================================================
// Eliminar un hospital
//==========================================================
app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital cono ese ID' }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;