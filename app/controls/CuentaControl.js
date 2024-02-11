'use strict';

const models = require('../models');
const Cuenta = models.cuenta;
const jwt = require('jsonwebtoken');

class CuentaControl {
    async listar(req, res) {
        try {
            const lista = await Cuenta.findAll({
                include: [
                    { model: models.persona, as: 'persona', attributes: ['nombres', 'apellidos', 'cedula', 'direccion', 'external_id'] },
                ],
                attributes: ['usuario', 'clave', 'estado', 'external_id']
            });
            res.status(200).json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async inicio_sesion(req, res) {
        try {
            if (req.body.hasOwnProperty('usuario') && req.body.hasOwnProperty('clave')) {
                let cuentaPersona = await Cuenta.findOne({
                    where: { usuario: req.body.usuario },
                    include: [
                        {model: models.persona,as: 'persona',attributes:['external_id',"apellidos","nombres"],include: [{model: models.rol, as: 'rol', attributes: ['nombre'],},],},
                    ],
                });

                if (!cuentaPersona) {
                    res.status(400).json({ message: "Error de solicitud", tag: "Cuenta no existente", code: 400 });
                } else {
                    if (cuentaPersona.estado === true) {
                        if (cuentaPersona.clave === req.body.clave) {
                            const token_data = {
                                external: cuentaPersona.external_id,
                                check: true
                            };
                            require('dotenv').config();
                            const key = process.env.KEY_SEC;
                            const token = jwt.sign(token_data, key, {
                                expiresIn: '24h'
                            });
                            const info = {
                                usuario:cuentaPersona.persona.apellidos,
                                token: token,
                                external_id: cuentaPersona.persona.external_id,
                                rol: cuentaPersona.persona.rol.nombre
                            };
                            res.status(200).json({ message: 'Éxito', data: info, code: 200 });
                        } else {
                            res.status(400).json({ message: "Error de solicitud", tag: "Clave o usuario no existente", code: 400 });
                        }
                    } else {
                        res.status(400).json({ message: "Error de solicitud", tag: "Cuenta desactivada", code: 400 });
                    }
                }
            } else {
                res.status(400).json({ message: "Error de solicitud", tag: "Faltan datos", code: 400 });
            }
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
}

module.exports = CuentaControl;