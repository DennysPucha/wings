"use strict";

const models = require("../models");
const { persona, rol, cuenta, sequelize, categoria, producto, resumen, venta } =
    models;
const uuid = require("uuid");
class ResumenControl {
    async obtener(req, res) {
        const external = req.params.external;
        try {
            const lista = await resumen.findOne({
                where: { external_id: external },
                attributes: ["numero", "fecha", "total", "external_id"],
            });
            if (!lista) {
                res.status(404);
                return res.json({
                    message: "Resumen no encontrado",
                    code: 404,
                    data: {},
                });
            }
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({
                message: "Error interno del servidor",
                code: 500,
                error: error.message,
            });
        }
    }

    async listar(req, res) {
        try {
            const lista = await resumen.findAll({
                attributes: ["numero", "fecha", "total", "external_id"],
            });
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({
                message: "Error interno del servidor",
                code: 500,
                error: error.message,
            });
        }
    }

    async guardar(req, res) {
        const { subtotal, total, persona: personaId } = req.body;
        const external = uuid.v4();
        if (subtotal && total && personaId) {
            try {
                const personaA = await persona.findOne({
                    where: { external_id: personaId },
                });
                if (!personaA) {
                    res.status(404);
                    return res.json({
                        message: "Persona no encontrada",
                        code: 404,
                        data: {},
                    });
                }
                const data = {
                    subtotal: subtotal,
                    total: total,
                    id_persona: personaA.id,
                    external_id: external,
                };

                const result = await resumen.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({
                        message: "ERROR",
                        tag: "No se puede crear",
                        code: 401,
                    });
                }
                res.status(200);
                res.json({ message: "EXITO", code: 200 });
            } catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
        } else {
            res.status(400);
            res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        const external = req.params.external;
        const { subtotal, total, persona: personaId } = req.body;
        if (subtotal && total && personaId) {
            try {
                const personaA = await persona.findOne({
                    where: { external_id: personaId },
                });
                if (!personaA) {
                    res.status(404);
                    return res.json({
                        message: "Persona no encontrada",
                        code: 404,
                        data: {},
                    });
                }
                const resumenA = await resumen.findOne({
                    where: { external_id: external },
                });
                if (!resumenA) {
                    res.status(404);
                    return res.json({
                        message: "Resumen no encontrado",
                        code: 404,
                        data: {},
                    });
                }
                const data = {
                    subtotal: subtotal,
                    total: total,
                    id_persona: personaA.id,
                    external_id: uuid.v4(),
                };
                const result = await resumenA.update(data, {
                    where: { external_id: external },
                });
                if (!result) {
                    res.status(401).json({ message: "No se puede modificar", code: 401 });
                } else {
                    res.status(200).json({ message: "Éxito", code: 200 });
                }
            } catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
        } else {
            res.status(400);
            res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
    }

    async generarResumenDiario(req, res) {
        const { persona: personaId } = req.body;
        if (personaId) {

            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                const formattedDate = `${year}/${month}/${day}`;

                console.log(formattedDate);
                const lista = await venta.findAll({
                    where: { fecha: formattedDate },
                });
                if (!lista) {
                    res.status(404);
                    return res.json({
                        message: "No hay ventas para el día de hoy",
                        code: 404,
                        data: {},
                    });
                }


                let total = 0;
                lista.forEach((venta) => {
                    total += venta.total;
                });

                const data = {
                    total: total,
                    fecha: formattedDate,
                    external_id: uuid.v4(),
                    id_persona: personaA.id,
                };

                console.log(data);

                const result = await resumen.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "No se puede crear", code: 401 });
                }
                res.status(200);
                res.json({ message: "Éxito", code: 200, data: lista });
            } catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
        }
    }

    async generarResumenSemana(req, res) {
        const { persona: personaId } = req.body;
        if (personaId) {
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const today = new Date();
                const week = [];
                for (let i = 0; i < 7; i++) {
                    const first = today.getDate() - today.getDay() + i;
                    const day = new Date(today.setDate(first)).toISOString().slice(0, 10);
                    week.push(day);
                }

                const lista = await venta.findAll({
                    where: { fecha: week },
                });
                if (!lista) {
                    res.status(404);
                    return res.json({
                        message: "No hay ventas para la semana",
                        code: 404,
                        data: {},
                    });
                }

                let total = 0;
                lista.forEach((venta) => {
                    total += venta.total;
                });

                const data = {
                    total: total,
                    fecha: week[0],
                    external_id: uuid.v4(),
                    id_persona: personaA.id,
                };

                const result = await resumen.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "No se puede crear", code: 401 });
                }
                res.status(200);
                res.json({ message: "Éxito", code: 200, data: lista });
            } catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
            res.status(400);
            res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
        }
        res.status(400);
            res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });   

    }

    async generarResumenMes(req, res) {
        const { persona: personaId } = req.body;
        if (personaId) {
            try{
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const lista = await venta.findAll({
                    where: { fecha: `${year}-${month}` },
                });
                if (!lista) {
                    res.status(404);
                    return res.json({
                        message: "No hay ventas para el mes",
                        code: 404,
                        data: {},
                    });
                }
                let total = 0;
                lista.forEach((venta) => {
                    total += venta.total;
                });
                const data = {
                    total: total,
                    fecha: `${year}-${month}`,
                    external_id: uuid.v4(),
                    id_persona: personaA.id,
                };
                
                const result = await resumen.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "No se puede crear", code: 401 });
                }
                res.status(200);
                res.json({ message: "Éxito", code: 200, data: lista });
            }            
            catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
        }
        res.status(400);
        res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
    }

    async generarResumenEntreFechas(req, res) {
        const { persona: personaId, fechaInicio, fechaFin } = req.body;
        if (personaId && fechaInicio && fechaFin) {
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }
                const lista = await venta.findAll({
                    where: { fecha: { [sequelize.Op.between]: [fechaInicio, fechaFin] } },
                });
                if (!lista) {
                    res.status(404);
                    return res.json({
                        message: "No hay ventas para el rango de fechas",
                        code: 404,
                        data: {},
                    });
                }
                let total = 0;
                lista.forEach((venta) => {
                    total += venta.total;
                });
                const data = {
                    total: total,
                    fecha: fechaInicio,
                    external_id: uuid.v4(),
                    id_persona: personaA.id,
                };
                const result = await resumen.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "No se puede crear", code: 401 });
                }
                res.status(200);
                res.json({ message: "Éxito", code: 200, data: lista });
            } catch (error) {
                res.status(500);
                res.json({
                    message: "Error interno del servidor",
                    code: 500,
                    error: error.message,
                });
            }
        }
        res.status(400);
        res.json({ message: "ERROR", tag: "Datos incorrectos", code: 400 });
    }
    
}
module.exports = ResumenControl;
