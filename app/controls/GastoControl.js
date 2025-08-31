"use strict";

const models = require("../models");
const uuid = require("uuid");
const {sequelize}= require("../models");
class GastoControl {
    async obtenerGasto(req, res) {
        const external = req.params.external;
        try {
            const gasto = await models.gasto.findOne({
                where: { external_id: external },
            });

            if (!gasto) {
                return res.json({ message: "Gasto no encontrado", data: {}, status: 404 });
            }

            res.json({ message: "Gasto encontrado", data: gasto, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }

    async listarGastosPorFecha(req, res) {
        const fecha = req.params.fecha;

        try {
            const gastos = await models.gasto.findAll({
                where: { fecha: fecha },
                order: [["createdAt", "DESC"]],
            });

            if (gastos.length === 0) {
                return res.json({ message: "No hay gastos en esta fecha", data: [], status:  200 });
            }

            res.json({ message: "Gastos encontrados", data: gastos, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }
    async crearGasto(req, res) {
        const { fecha, detalle, total } = req.body;

        try {
            const nuevoGasto = await models.gasto.create({
                fecha,
                detalle,
                total,
                external_id: uuid.v4(),
            });

            res.json({ message: "Gasto creado", data: nuevoGasto, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }
    async actualizarGasto(req, res) {
        const external = req.params.external;
        const { fecha, detalle, total } = req.body;

        try {
            const gasto = await models.gasto.findOne({
                where: { external_id: external },
            });

            if (!gasto) {
                return res.json({ message: "Gasto no encontrado", data: {}, status: 404 });
            }

            gasto.fecha = fecha || gasto.fecha;
            gasto.detalle = detalle || gasto.detalle;
            gasto.total = total || gasto.total;

            await gasto.save();

            res.json({ message: "Gasto actualizado", data: gasto, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }

    async eliminarGasto(req, res) {
        const external = req.params.external;

        try {
            const gasto = await models.gasto.findOne({
                where: { external_id: external },
            });

            if (!gasto) {
                return res.json({ message: "Gasto no encontrado", data: {}, status: 404 });
            }

            await gasto.destroy();

            res.json({ message: "Gasto eliminado", data: {}, status: 200 });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error del servidor" });
        }
    }

    async compararVentasYGastosPorDia(req, res) {
        const { fecha } = req.body;
    
        if (!fecha) {
            res.status(400);
            return res.json({ message: "Falta la fecha", code: 400 });
        }
    
        try {
            // Sumar ventas del día
            const ventasDelDia = await sequelize.query(
                `
                SELECT SUM(total) as total_ventas
                FROM venta
                WHERE fecha = :fecha AND estado = true
                `,
                {
                    replacements: { fecha },
                    type: sequelize.QueryTypes.SELECT
                }
            );
    
            // Sumar gastos del día
            const gastosDelDia = await sequelize.query(
                `
                SELECT SUM(total) as total_gastos
                FROM gasto
                WHERE fecha = :fecha
                `,
                {
                    replacements: { fecha },
                    type: sequelize.QueryTypes.SELECT
                }
            );
    
            const totalVentas = ventasDelDia[0].total_ventas || 0;
            const totalGastos = gastosDelDia[0].total_gastos || 0;
    
            res.status(200).json({
                message: "Éxito",
                code: 200,
                data: {
                    fecha,
                    totalVentas,
                    totalGastos,
                    diferencia: totalVentas - totalGastos
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    
}

module.exports = GastoControl;