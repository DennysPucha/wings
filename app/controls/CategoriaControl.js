'use strict';

const models = require('../models');
const {persona, rol, cuenta, sequelize, categoria, producto } = models;
const uuid = require('uuid');

class CategoriaControl{
    async obtener(req,res){
        const external = req.params.external;
        try {
            const lista = await categoria.findOne({
                where:{external_id:external},
                attributes:['nombre','external_id']
            });
            if(!lista){
                res.status(404);
                return res.json({message:"Categoria no encontrada",code:404,data:{}});
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
            const lista = await categoria.findAll({
                attributes:['nombre','external_id']
            });
            res.status(200);
            res.json({message:"Éxito",code:200,data:lista});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }

    async guardar(req,res){
        const {nombre} = req.body;
        if(nombre){
            try {
                const data = {
                    nombre:nombre,
                    external_id:uuid.v4()
                };
                const result = await categoria.create(data);
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
        }else{
            res.status(400);
            res.json({message:"ERROR",tag:"Datos incorrectos",code:400});
        }
    }

    async modificar(req,res){
        const external = req.params.external;
        const {nombre} = req.body;
        if(nombre){
            try {
                const data = {
                    nombre:nombre,
                    external_id:uuid.v4()
                };

                const categoriaA= await categoria.findOne({where:{external_id:external}});
                if (!categoriaA) {
                    res.status(404);
                    return res.json({ message: "Categoria no encontrada", code: 404, data: {} });
                }

                const result = await categoriaA.update(data,{where:{external_id:external}});
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
        }else{
            res.status(400);
            res.json({message:"ERROR",tag:"Datos incorrectos",code:400});
        }
    }

    async eliminarCategoria(req,res){
        const external = req.params.external;
        try {
            const categoriaA= await categoria.findOne({where:{external_id:external}});
            if (!categoriaA) {
                res.status(404);
                return res.json({ message: "Categoria no encontrada", code: 404, data: {} });
            }
            const result = await categoriaA.destroy({where:{external_id:external}});
            if(!result){
                res.status(401);
                return res.json({message:"ERROR",tag:"No se puede eliminar",code:401});
            }
            res.status(200);
            res.json({message:"EXITO",code:200});
        } catch (error) {
            res.status(500);
            res.json({message:"Error interno del servidor",code:500,error:error.message});
        }
    }
}
module.exports = CategoriaControl;