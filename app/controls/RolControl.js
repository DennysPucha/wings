'use strict';
const cron = require("node-cron");
const models = require('../models');
const Rol = models.rol;

class RolControl {
    async listar(req, res) {
        try {
            const lista = await Rol.findAll({
                attributes: ['nombre', 'external_id']
            });
            print(lista);
            res.status(200).json({ message: "EXITO", code: 200, data: lista });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async guardar(req, res) {
        try {
            if (req.body.hasOwnProperty('nombre')) {
                const uuid = require('uuid');
                const data = {
                    nombre: req.body.nombre,
                    external_id: uuid.v4()
                };

                const result = await Rol.create(data);

                if (!result) {
                    res.status(401).json({ message: "ERROR", tag: "No se puede crear", code: 401 });
                } else {
                    res.status(200).json({ message: "EXITO", code: 200 });
                }
            } else {
                res.status(400).json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
            }
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    iniciarTareaPeriodica(){
        cron.schedule('*/5 * * * *', async () => {
            console.log('Consultando roles...');
            await listar();
        });
    }
    
}

module.exports = RolControl;
