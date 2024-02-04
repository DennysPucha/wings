'use strict';

const models = require('../models');
const { persona, rol, cuenta, sequelize, categoria, producto, venta,detalle } = models;
const uuid = require('uuid');

class VentaControl{
    async obtener(req,res){
        const external = req.params.external;
        try {
            const lista = await venta.findOne({
                where:{external_id:external},
                include: [{ model: detalle, as: 'detalle', attributes: ['numero','cantidad','producto','precio','external_id'] },],
                attributes:['numero','fecha','total','subtotal','estado','external_id','hora','metodo']
            });
            if(!lista){
                res.status(404);
                return res.json({message:"Venta no encontrada",code:404,data:{}});
            }
            res.status(200);
            res.json({message:"Éxito",code:200,data:lista});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }

    async listar(req,res){
        try {
            const lista = await venta.findAll({
                include: [{ model: detalle, as: 'detalle', attributes: ['numero','cantidad','producto','precio','external_id'] },],
                attributes:['numero','fecha','total','subtotal','estado','external_id','hora','metodo']
            });
            res.status(200);
            res.json({message:"Éxito",code:200,data:lista});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }

    async guardar(req,res){
        const {total, subtotal, persona: personaId } = req.body;
        const external = uuid.v4();
        if(total && subtotal && personaId){
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }
                const data = {
                    total: total,
                    subtotal: subtotal,
                    id_persona: personaA.id,
                    external_id: external
                };
                const result = await venta.create(data);
                if(!result){
                    res.status(401);
                    return res.json({message:"ERROR",tag:"No se puede crear",code:401});
                }
                res.status(200);
                res.json({message:"EXITO",code:200});
            } catch (error) {
                res.status(500);
                res.json({message:"Error interno del servidor",code:500,error:error.message});
            }
        }
        else{
            res.status(400);
            res.json({message:"Faltan datos",code:400});
        }
    }

    async guardarVentaConDetalle(req, res) {
        const { metodo, fecha, total, subtotal, persona: personaId, detalles } = req.body;
        const externalVenta = uuid.v4();

        if (metodo!=null && fecha!=null && total !== null && subtotal !== null && personaId && detalles && detalles.length > 0) {
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });

                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }
                if(metodo!="Efectivo" && metodo!="Tarjeta de credito" && metodo!="Transferencia"){
                    res.status(400);
                    return res.json({ message: "Metodo de pago no valido", code: 400 });
                }

                const dataVenta = {
                    metodo: metodo,
                    fecha:fecha,
                    total: total,
                    subtotal: subtotal,
                    id_persona: personaA.id,
                    external_id: externalVenta
                };

                const transaction = await sequelize.transaction();

                try {
                    const resultVenta = await venta.create(dataVenta, { transaction });

                    if (!resultVenta) {
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se puede crear la venta", code: 401 });
                    }


                    const detallesData = detalles.map(async detalle => {
                        const productoA = await producto.findOne({ where: { external_id: detalle.producto } });

                        if (!productoA) {
                            return undefined;
                        }

                        
                        return {
                            cantidad: detalle.cantidad,
                            producto: productoA.external_id,
                            precio: productoA.precio,
                            external_id: uuid.v4(),
                            id_venta: resultVenta.id
                        };
                    });

                    const detallesValidos = await Promise.all(detallesData);
                    const detallesFiltrados = detallesValidos.filter(detalle => detalle !== undefined);
                    console.log(detallesFiltrados);
                    const response = await detalle.bulkCreate(detallesFiltrados, { transaction });

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

    async modificarVentaConDetalle(req, res) {
        const { fecha, hora, total, subtotal, persona: personaId, detalles, metodo} = req.body;
        const externalVenta = req.params.external;

        if (metodo!= null && fecha!= null && hora!=null && total !== null && subtotal !== null && personaId && detalles && detalles.length > 0) {
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });

                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const ventaA = await venta.findOne({ where: { external_id: externalVenta } });

                if (!ventaA) {
                    res.status(404);
                    return res.json({ message: "Venta no encontrada", code: 404, data: {} });
                }
                if(metodo!="Efectivo" && metodo!="Tarjeta de credito" && metodo!="Transferencia"){
                    res.status(400);
                    return res.json({ message: "Metodo de pago no valido", code: 400 });
                }

                const dataVenta = {
                    metodo: metodo,
                    fecha: fecha,
                    hora: hora,
                    total: total,
                    subtotal: subtotal,
                    id_persona: personaA.id,
                };

                const transaction = await sequelize.transaction();

                try {
                    const resultVenta = await ventaA.update(dataVenta, { transaction });

                    if (!resultVenta) {
                        res.status(401);
                        return res.json({ message: "ERROR", tag: "No se puede modificar la venta", code: 401 });
                    }

                    await detalle.destroy({ where: { id_venta: resultVenta.id } }, { transaction });

                    const detallesData = detalles.map(async detalle => {
                        const productoA = await producto.findOne({ where: { external_id: detalle.producto } });

                        if (!productoA) {
                            return undefined;
                        }

                        return {
                            cantidad: detalle.cantidad,
                            producto: productoA.external_id,
                            precio: detalle.precio,
                            external_id: uuid.v4(),
                            id_venta: resultVenta.id
                        };
                    });

                    const detallesValidos = await Promise.all(detallesData);
                    const detallesFiltrados = detallesValidos.filter(detalle => detalle !== undefined);

                    console.log(detallesFiltrados);
                    const response = await detalle.bulkCreate(detallesFiltrados, { transaction });

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
    
    async modificar(req,res){
        const external = req.params.external;
        const {total, subtotal,estado, persona: personaId } = req.body;
        if( total && subtotal && personaId && estado){
            try {
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const ventaA= await venta.findOne({ where: { external_id: external } });

                const data = {
                    total: total,
                    subtotal: subtotal,
                    estado: estado,
                    id_persona: personaA.id,
                    external_id: uuid.v4()
                };
                const result = await ventaA.update(data,{where:{external_id:external}});
                if(!result){
                    res.status(401);
                    return res.json({message:"ERROR",tag:"No se puede modificar",code:401});
                }
                res.status(200);
                res.json({message:"EXITO",code:200});
            } catch (error) {
                res.status(500);
                res.json({message:"Error interno del servidor",code:500,error:error.message});
            }
        }
        else{
            res.status(400);
            res.json({message:"Faltan datos",code:400});
        }
    }

    async darBaja(req,res){
        const external = req.params.external;
        try {
            const ventaA= await venta.findOne({ where: { external_id: external } });
            if(!ventaA){
                res.status(404);
                return res.json({message:"Venta no encontrada",code:404,data:{}});
            }
            const result = await ventaA.update({estado:false},{where:{external_id:external}});
            if(!result){
                res.status(401);
                return res.json({message:"ERROR",tag:"No se puede dar de baja",code:401});
            }
            res.status(200);
            res.json({message:"EXITO",code:200});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }
    async cambiarEstado(req,res){
        const external = req.params.external;
        const {estado} = req.body;
        try {
            const ventaA= await venta.findOne({ where: { external_id: external } });
            if(!ventaA){
                res.status(404);
                return res.json({message:"Venta no encontrada",code:404,data:{}});
            }
            const result = await ventaA.update({estado:estado},{where:{external_id:external}});
            if(!result){
                res.status(401);
                return res.json({message:"ERROR",tag:"No se puede cambiar el estado",code:401});
            }
            res.status(200);
            res.json({message:"EXITO",code:200});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }
    
    async filtrarVentasPorFecha(req, res) {
        const { fechaInicio, fechaFin, metodo } = req.body;
    
        if (!fechaInicio || !fechaFin) {
            res.status(400);
            return res.json({ message: "Faltan fechas", code: 400 });
        }
    
        let whereClause = "v.fecha BETWEEN :fechaInicio AND :fechaFin AND v.estado = true";
    
        // Añadir condición para el método de pago si no es "Ninguna"
        if (metodo !== undefined && metodo !== "Ninguna") {
            whereClause += " AND v.metodo = :metodo";
        }
    
        try {
            const ventasFiltradas = await sequelize.query(
                `
                SELECT
                    v.fecha,
                    SUM(v.total) as total_ventas
                FROM
                    venta v
                WHERE
                    ${whereClause}
                GROUP BY
                    v.fecha
                `,
                {
                    replacements: { fechaInicio, fechaFin, metodo },
                    type: sequelize.QueryTypes.SELECT,
                }
            );
    
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: ventasFiltradas });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    async filtrarVentasPorNumero(req, res) {
        const { numeroVenta } = req.body;
    
        if (!numeroVenta) {
            res.status(400);
            return res.json({ message: "Falta el número de venta", code: 400 });
        }
    
        try {
            const ventaFiltrada = await venta.findOne({
                include: [
                    {
                        model: detalle,
                        as: 'detalle',
                        attributes: ['numero', 'cantidad', 'producto', 'precio', 'external_id']
                    },
                ],
                attributes: ['numero', 'fecha', 'total', 'subtotal', 'estado', 'external_id'],
                where: {
                    estado: true, // Only include ventas with estado set to true
                    numero: numeroVenta,
                },
            });
    
            if (!ventaFiltrada) {
                res.status(404);
                return res.json({ message: "Venta no encontrada", code: 404, data: {} });
            }
    
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: ventaFiltrada });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async listarConPaginacion(req, res) {
        const { page, itemsPerPage } = req.query;
    
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(itemsPerPage) || 10;
    
        try {
            const offset = (pageNumber - 1) * pageSize;
            const { count, rows } = await venta.findAndCountAll({
                include: [
                    {
                        model: detalle,
                        as: 'detalle',
                        attributes: ['numero', 'cantidad', 'producto', 'precio', 'external_id']
                    },
                ],
                attributes: ['numero', 'fecha', 'total', 'subtotal', 'estado', 'external_id'],
                where: {
                    estado: true, // Only include ventas with estado set to true
                },
                limit: pageSize,
                offset: offset,
            });
    
            const totalPages = Math.ceil(count / pageSize);
    
            res.status(200);
            res.json({
                message: "Éxito",
                code: 200,
                data: {
                    ventas: rows,
                    totalPages: totalPages,
                    currentPage: pageNumber,
                },
            });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async cambiarEstadoAllVentas(req, res) {
        const { estado } = req.body;
        try {
            const lista = await venta.findAll({where: {estado: !estado }});
            console.log(lista);
            const result = await Promise.all(lista.map(async (venta) => {
                await venta.update({ estado: estado });
            }));
            console.log(result);
            if (!result) {
                res.status(401);
                return res.json({ message: "ERROR", tag: "No se puede cambiar el estado", code: 401 });
            }
            res.status(200);
            res.json({ message: "EXITO", code: 200 });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    async listarUltimasVentas(req, res) {
        try {
            const lista = await venta.findAll({
                include: [{ model: detalle, as: 'detalle', attributes: ['numero', 'cantidad', 'producto', 'precio', 'external_id'] }],
                attributes: ['numero', 'fecha', 'total', 'subtotal', 'estado', 'external_id','hora'],
                order: [['hora', 'DESC']],
                where: { estado: true },
                limit: 10,
            });
    
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

}
module.exports = VentaControl;