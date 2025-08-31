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
        const { fechaInicio, fechaFin } = req.body;

        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ message: "Faltan fechas", code: 400 });
        }
    
        try {
            // Sumar ventas en el rango
            const ventas = await sequelize.query(
                `SELECT fecha, SUM(total) as total_ventas 
                 FROM venta 
                 WHERE fecha BETWEEN :fechaInicio AND :fechaFin AND estado = true
                 GROUP BY fecha
                 ORDER BY fecha ASC`,
                { replacements: { fechaInicio, fechaFin }, type: sequelize.QueryTypes.SELECT }
            );
    
            // Sumar gastos en el rango
            const gastos = await sequelize.query(
                `SELECT fecha, SUM(total) as total_gastos 
                 FROM gasto 
                 WHERE fecha BETWEEN :fechaInicio AND :fechaFin
                 GROUP BY fecha
                 ORDER BY fecha ASC`,
                { replacements: { fechaInicio, fechaFin }, type: sequelize.QueryTypes.SELECT }
            );
    
            // Combinar ventas y gastos por fecha
            const fechas = Array.from(new Set([...ventas.map(v => v.fecha), ...gastos.map(g => g.fecha)])).sort();
            const resultados = fechas.map(fecha => {
                const venta = ventas.find(v => v.fecha === fecha)?.total_ventas || 0;
                const gasto = gastos.find(g => g.fecha === fecha)?.total_gastos || 0;
                return { fecha, totalVentas: parseFloat(venta), totalGastos: parseFloat(gasto), diferencia: parseFloat(venta - gasto) };
            });
    
            return res.status(200).json({ message: "Éxito", code: 200, data: resultados });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    
}

module.exports = GastoControl;