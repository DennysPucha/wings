'use strict';

const models = require('../models');
const { mesa, venta, detalle, producto, sequelize } = models;
const uuid = require('uuid');
const Utils = require('../utils/utils');
const URL_FRONT = "https://totoswings.vercel.app/";

class MesaControl {
    async obtener(req, res) {
        const external = req.params.external;
        try {
            const mesaEncontrada = await mesa.findOne({
                where: { external_id: external },
                attributes: ['numero', 'QRCode', 'external_id']
            });

            if (!mesaEncontrada) {
                res.status(404);
                return res.json({ message: "Mesa no encontrada", code: 404, data: {} });
            }

            res.status(200);
            res.json({ message: "Éxito", code: 200, data: mesaEncontrada });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const lista = await mesa.findAll({
                attributes: ['numero', 'external_id']
            });
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async guardar(req, res) {
        const { numero } = req.body;
        const external = uuid.v4();

        if (numero) {
            try {
                const qrCode = await Utils.generarQr(URL_FRONT + `${external}`);

                const data = {
                    numero: numero,
                    QRCode: qrCode,
                    external_id: external
                };

                const result = await mesa.create(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "ERROR", tag: "No se puede crear", code: 401 });
                }

                res.status(200);
                res.json({ message: "ÉXITO", code: 200, data: data });
            } catch (error) {
                res.status(500);
                res.json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400);
            res.json({ message: "Faltan datos", code: 400 });
        }
    }

    async modificar(req, res) {
        const external = req.params.external;
        const { numero } = req.body;

        if (numero) {
            try {
                const mesaA = await mesa.findOne({ where: { external_id: external } });

                if (!mesaA) {
                    res.status(404);
                    return res.json({ message: "Mesa no encontrada", code: 404, data: {} });
                }

                const newExternal = uuid.v4();

                const data = {
                    numero: numero,
                    external_id: newExternal
                };

                const result = await mesaA.update(data);
                if (!result) {
                    res.status(401);
                    return res.json({ message: "ERROR", tag: "No se puede modificar", code: 401 });
                }

                res.status(200);
                res.json({ message: "ÉXITO", code: 200, data: data });
            } catch (error) {
                res.status(500);
                res.json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400);
            res.json({ message: "Faltan datos", code: 400 });
        }
    }

    async obtenerVentaMesa(req, res) {
        const external_mesa = req.params.external_mesa;
        const external_venta = req.params.external_venta;

        try {
            const mesaEncontrada = await mesa.findOne({
                where: { external_id: external_mesa },
                attributes: ['id', 'numero', 'external_id']
            });

            if (!mesaEncontrada) {
                res.status(404);
                return res.json({ message: "Mesa no encontrada", code: 404, data: {} });
            }

            const ventaEncontrada = await venta.findOne({
                where: { 
                    external_id: external_venta,
                    id_mesa: mesaEncontrada.id,
                    estado: true
                },
                attributes: ['numero', 'fecha', 'hora', 'total', 'subtotal', 'estado', 'metodo', 'cliente', 'external_id'],
                include: [{
                    model: detalle,
                    as: 'detalle',
                    attributes: ['numero', 'cantidad', 'producto', 'precio', 'external_id']
                }]
            });

            if (!ventaEncontrada) {
                res.status(404);
                return res.json({ message: "Venta no encontrada para esta mesa", code: 404, data: {} });
            }

            const ventaData = ventaEncontrada.toJSON();
            ventaData.detalles = ventaData.detalle;
            delete ventaData.detalle;

            res.status(200);
            res.json({
                message: "Éxito",
                code: 200,
                data: {
                    mesa: {
                        numero: mesaEncontrada.numero,
                        QRCode: mesaEncontrada.QRCode,
                        external_id: mesaEncontrada.external_id
                    },
                    venta: ventaData
                }
            });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async listarVentaMesa(req, res) {
        const external_mesa = req.params.external;

        try {
            const mesaEncontrada = await mesa.findOne({
                where: { external_id: external_mesa },
                attributes: ['numero', 'external_id','id']
            });

            if (!mesaEncontrada) {
                res.status(404);
                return res.json({ message: "Mesa no encontrada", code: 404, data: {} });
            }

            const ventasMesa = await venta.findAll({
                where: { id_mesa: mesaEncontrada.id, estado: true },
                include: [
                    {
                        model: detalle,
                        as: 'detalle',
                        attributes: ['numero', 'cantidad', 'producto', 'precio', 'external_id']
                    }
                ],
                attributes: ['numero', 'fecha', 'hora', 'total', 'subtotal', 'estado', 'metodo', 'cliente', 'external_id']
            });

            res.status(200);
            res.json({
                message: "Éxito",
                code: 200,
                data: {
                    mesa: mesaEncontrada,
                    ventas: ventasMesa
                }
            });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async guardarVentaMesa(req, res) {
        const external_mesa = req.params.external;
        const { metodo, fecha, total, subtotal, detalles, cliente } = req.body;
        const externalVenta = uuid.v4();
    
        if (metodo != null && fecha != null && total !== null && subtotal !== null && detalles && detalles.length > 0) {
            try {
                const mesaA = await mesa.findOne({ where: { external_id: external_mesa } });
    
                if (!mesaA) {
                    res.status(404);
                    return res.json({ message: "Mesa no encontrada", code: 404, data: {} });
                }
    
                if (metodo != "Efectivo" && metodo != "Tarjeta de credito" && metodo != "Transferencia") {
                    res.status(400);
                    return res.json({ message: "Método de pago no válido", code: 400 });
                }
    
                const dataVenta = {
                    metodo: metodo,
                    fecha: fecha,
                    total: total,
                    subtotal: subtotal,
                    id_mesa: mesaA.id,
                    external_id: externalVenta,
                    cliente: cliente
                };
    
                const transaction = await sequelize.transaction();
    
                try {
                    const resultVenta = await venta.create(dataVenta, { transaction });
    
                    if (!resultVenta) {
                        await transaction.rollback();
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se puede crear la venta", code: 401 });
                    }
    
                    const detallesData = await Promise.all(detalles.map(async detalle => {
                        const productoA = await producto.findOne({ where: { external_id: detalle.producto } });
    
                        if (!productoA) {
                            throw new Error(`Producto con external_id ${detalle.producto} no encontrado`);
                        }
    
                        return {
                            cantidad: detalle.cantidad,
                            producto: productoA.external_id,
                            precio: productoA.precio,
                            external_id: uuid.v4(),
                            id_venta: resultVenta.id
                        };
                    }));
    
                    const response = await detalle.bulkCreate(detallesData, { transaction });
    
                    if (!response) {
                        await transaction.rollback();
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se pueden crear los detalles", code: 401 });
                    }
    
                    await transaction.commit();
    
                    res.status(200);
                    res.json({ message: "ÉXITO", code: 200 });
                } catch (error) {
                    await transaction.rollback();
                    res.status(500);
                    res.json({ message: "Error interno del servidor", code: 500, error: error.message });
                }
            } catch (error) {
                res.status(500);
                res.json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400);
            res.json({ message: "Faltan datos", code: 400 });
        }
    }
    
    async modificarVentaMesa(req, res) {
        const external_venta = req.params.external;
        const { metodo, fecha, hora, total, subtotal, detalles, cliente } = req.body;
    
        if (metodo != null && fecha != null && hora != null && total !== null && subtotal !== null && detalles && detalles.length > 0) {
            try {
                const ventaA = await venta.findOne({ 
                    where: { external_id: external_venta },
                    include: [{ model: mesa, as: 'mesa' }]
                });
    
                if (!ventaA) {
                    res.status(404);
                    return res.json({ message: "Venta no encontrada", code: 404, data: {} });
                }
    
                if (metodo != "Efectivo" && metodo != "Tarjeta de credito" && metodo != "Transferencia") {
                    res.status(400);
                    return res.json({ message: "Método de pago no válido", code: 400 });
                }
    
                const dataVenta = {
                    metodo: metodo,
                    fecha: fecha,
                    hora: hora,
                    total: total,
                    subtotal: subtotal,
                    cliente: cliente
                };
    
                const transaction = await sequelize.transaction();
    
                try {
                    const resultVenta = await ventaA.update(dataVenta, { transaction });
    
                    if (!resultVenta) {
                        await transaction.rollback();
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se puede modificar la venta", code: 401 });
                    }
    
                    await detalle.destroy({ where: { id_venta: resultVenta.id } }, { transaction });
    
                    const detallesData = await Promise.all(detalles.map(async det => {
                        const productoA = await producto.findOne({ where: { external_id: det.producto } });
    
                        if (!productoA) {
                            throw new Error(`Producto con external_id ${det.producto} no encontrado`);
                        }
    
                        return {
                            cantidad: det.cantidad,
                            producto: productoA.external_id,
                            precio: productoA.precio,
                            external_id: uuid.v4(),
                            id_venta: resultVenta.id
                        };
                    }));
    
                    const response = await detalle.bulkCreate(detallesData, { transaction });
    
                    if (!response) {
                        await transaction.rollback();
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se pueden crear los nuevos detalles", code: 401 });
                    }
    
                    await transaction.commit();
    
                    res.status(200);
                    res.json({ message: "ÉXITO", code: 200 });
                } catch (error) {
                    await transaction.rollback();
                    res.status(500);
                    res.json({ message: "Error interno del servidor", code: 500, error: error.message });
                }
            } catch (error) {
                res.status(500);
                res.json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400);
            res.json({ message: "Faltan datos", code: 400 });
        }
    }

    async eliminarVentaMesa(req, res) {
        const external_venta = req.params.external;

        try {
            const ventaA = await venta.findOne({ 
                where: { external_id: external_venta },
                include: [{ model: mesa, as: 'mesa' }]
            });

            if (!ventaA) {
                res.status(404);
                return res.json({ message: "Venta no encontrada", code: 404, data: {} });
            }

            const result = await ventaA.update({ estado: false });

            if (!result) {
                res.status(401);
                return res.json({ message: "ERROR", tag: "No se puede eliminar la venta", code: 401 });
            }

            res.status(200);
            res.json({ message: "ÉXITO", code: 200 });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
}

module.exports = MesaControl;