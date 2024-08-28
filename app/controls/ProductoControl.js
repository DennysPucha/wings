'use strict';

const models = require('../models');
const { persona, rol, cuenta, sequelize, categoria, producto } = models;
const uuid = require('uuid');
const { v2: cloudinary } = require('cloudinary');
const env = require('dotenv').config();

cloudinary.config({ 
    cloud_name: 'dbxjk52y8', 
    api_key: '198326795776323', 
    api_secret: process.env.API_CLOUDINARY_SECRET,
});

class ProductoControl {
    async obtener(req, res) {
        const external = req.params.external;
        try {
            const lista = await producto.findOne({
                where: { external_id: external },
                include: [{ model: categoria, as: 'categoria', attributes: ['nombre'] },],
                attributes: ['nombre', 'descripcion', 'costo', 'precio', 'imagen', 'external_id','estado']
            });
            if (!lista) {
                res.status(404);
                return res.json({ message: "Producto no encontrado", code: 404, data: {} });
            }
            
            console.log(lista);
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const lista = await producto.findAll({
                where: { estado: true }, 
                include: [{ model: categoria, as: 'categoria', attributes: ['nombre'] },],
                attributes: ['nombre', 'descripcion', 'costo', 'precio', 'imagen', 'external_id','estado']
            });
            res.status(200);
            res.json({ message: "Éxito", code: 200, data: lista });
        } catch (error) {
            res.status(500);
            res.json({ message: "Error interno del servidor", code: 500, error: error.message });
        }
    }

    async guardar(req, res) {
        const { nombre, descripcion, costo, precio, categoria: categoriaId, persona: personaId } = req.body;
        if (nombre && descripcion && costo && precio  && categoriaId && personaId) {
            try {
                const categoriaA = await categoria.findOne({ where: { external_id: categoriaId } });
                if (!categoriaA) {
                    res.status(404);
                    return res.json({ message: "Categoria no encontrada", code: 404, data: {} });
                }
                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const data = {
                    nombre: nombre,
                    descripcion: descripcion,
                    costo: costo,
                    precio: precio,
                    id_persona: personaA.id,
                    id_categoria: categoriaA.id,
                    external_id: uuid.v4()
                };
                console.log("data", data);
                const result = await producto.create(data);
                if (!result) {
                    res.status(401).json({ message: "No se puede crear", code: 401 });
                } else {
                    res.status(200).json({ message: "Éxito", code: 200 });
                }
            } catch (error) {
                res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400).json({ message: "Datos incorrectos", code: 400 });
        }
    }

    async modificar(req, res) {
        const external = req.params.external;
        const { nombre, descripcion, costo, precio, categoria: categoriaId, persona: personaId} = req.body;
        if (nombre && descripcion && costo && precio  && categoriaId && personaId) {
            try {
                const categoriaA = await categoria.findOne({ where: { external_id: categoriaId } });
                if (!categoriaA) {
                    res.status(404);
                    return res.json({ message: "Categoria no encontrada", code: 404, data: {} });
                }

                const personaA = await persona.findOne({ where: { external_id: personaId } });
                if (!personaA) {
                    res.status(404);
                    return res.json({ message: "Persona no encontrada", code: 404, data: {} });
                }

                const productoA = await producto.findOne({ where: { external_id: external } });
                if (!productoA) {
                    res.status(404);
                    return res.json({ message: "Producto no encontrado", code: 404, data: {} });
                }
                const data = {
                    nombre: nombre,
                    descripcion: descripcion,
                    costo: costo,
                    precio: precio,
                    id_categoria: categoriaA.id,
                    id_persona: personaA.id,
                };
                const result = await producto.update(data, { where: { external_id: external } });
                if (!result) {
                    res.status(401).json({ message: "No se puede modificar", code: 401 });
                } else {
                    res.status(200).json({ message: "Éxito", code: 200 });
                }
            } catch (error) {
                res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
            }
        } else {
            res.status(400).json({ message: "Datos incorrectos", code: 400 });
        }
    }

    async darBaja(req,res){
        const external = req.params.external;
        try {
            const productoA= await producto.findOne({ where: { external_id: external } });
            if (!productoA) {
                res.status(404);
                return res.json({ message: "Producto no encontrado", code: 404, data: {} });
            }
            const result = await productoA.update({estado:false},{where:{external_id:external}});
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


    async  guardarProductoConImagen(req, res) {
        const { nombre, descripcion, costo, precio, categoria: categoriaId, persona: personaId } = req.body;
        const imagenFile = req.files ? req.files.imagen : null;
      
        if (nombre && descripcion && costo && precio && categoriaId && personaId && imagenFile) {
          try {
            const categoriaA = await categoria.findOne({ where: { external_id: categoriaId } });
            if (!categoriaA) {
              return res.status(404).json({ message: "Categoria no encontrada", code: 404, data: {} });
            }
      
            const personaA = await persona.findOne({ where: { external_id: personaId } });
            if (!personaA) {
              return res.status(404).json({ message: "Persona no encontrada", code: 404, data: {} });
            }
      
            // Subir imagen a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(imagenFile.tempFilePath, {
              folder: 'productos',
              public_id: `producto_${uuid.v4()}`,
            });
      
            const data = {
              nombre,
              descripcion,
              costo,
              precio,
              id_persona: personaA.id,
              id_categoria: categoriaA.id,
              imagen: uploadResult.secure_url,
              external_id: uuid.v4()
            };
      
            const result = await producto.create(data);
            if (!result) {
              return res.status(401).json({ message: "No se puede crear", code: 401 });
            }
      
            res.status(200).json({ message: "Éxito", code: 200, data: result });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
          }
        } else {
          res.status(400).json({ message: "Datos incorrectos", code: 400 });
        }
      }
      
      async modificarProductoConImagen(req, res) {
        const external = req.params.external;
        const { nombre, descripcion, costo, precio, categoria: categoriaId, persona: personaId } = req.body;
        const imagenFile = req.files ? req.files.imagen : null;
      
        if (nombre && descripcion && costo && precio && categoriaId && personaId && imagenFile) {
          try {
            const categoriaA = await categoria.findOne({ where: { external_id: categoriaId } });
            if (!categoriaA) {
              return res.status(404).json({ message: "Categoria no encontrada", code: 404, data: {} });
            }
      
            const personaA = await persona.findOne({ where: { external_id: personaId } });
            if (!personaA) {
              return res.status(404).json({ message: "Persona no encontrada", code: 404, data: {} });
            }
      
            const productoA = await producto.findOne({ where: { external_id: external } });
            if (!productoA) {
              return res.status(404).json({ message: "Producto no encontrado", code: 404, data: {} });
            }
      
            // Subir imagen a Cloudinary
            const uploadResult = await cloudinary.uploader.upload(imagenFile.tempFilePath, {
              folder: 'productos',
              public_id: `producto_${uuid.v4()}`,
            });
      
            const data = {
              nombre,
              descripcion,
              costo,
              precio,
              id_categoria: categoriaA.id,
              id_persona: personaA.id,
              imagen: uploadResult.secure_url,
            };
      
            const result = await producto.update(data, { where: { external_id: external } });
            if (!result) {
              return res.status(401).json({ message: "No se puede modificar", code: 401 });
            }
      
            res.status(200).json({ message: "Éxito", code: 200 });
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error interno del servidor", code: 500, error: error.message });
          }
        } else {
          res.status(400).json({ message: "Datos incorrectos", code: 400 });
        }
      }

}
module.exports = ProductoControl;