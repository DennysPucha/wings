'use strict';

const models = require('../models');
const Rol = models.rol;
const axios = require("axios");
const cron = require("node-cron");  
class RolControl {
    async listar(req, res) {
        try {
            const lista = await Rol.findAll({
                attributes: ['nombre', 'external_id']
            });
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

     iniciarTareaPeriodica() {
        cron.schedule("*/1 * * * *", async () => {
          console.log("Iniciando tarea periódica de roles...");
          try {
            const response = await axios.get("https://wings-wwmh.onrender.com/totos/listar/roles");
            console.log("Solicitud realizada con éxito:", response.status);
          } catch (error) {
            console.error("Error al realizar la solicitud:", error.message);
          }
        });
      }
    
}

module.exports = RolControl;
