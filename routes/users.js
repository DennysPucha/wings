'use strict';

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const PersonaController = require('../app/controls/PersonaControl');
const RolController = require('../app/controls/RolControl');
const CuentaController = require('../app/controls/CuentaControl');
const ProductoController = require('../app/controls/ProductoControl');
const CategoriaController = require('../app/controls/CategoriaControl');
const ResumenController = require('../app/controls/ResumenControl');
const DetalleController = require('../app/controls/DetalleControl');
const VentaController = require('../app/controls/VentaControl');


const personaController = new PersonaController();
const rolController = new RolController();
const cuentaController = new CuentaController();
const productoController = new ProductoController();
const categoriaController = new CategoriaController();
const resumenController = new ResumenController();
const detalleController = new DetalleController();
const ventaController = new VentaController();


router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

const middlewareAutentificacion = async (req, res, next) => {
    try {
        const token = req.headers['token-wings'];

        if (!token) {
            return res.status(401).json({ message: "Falta Token", code: 401 });
        }

        require('dotenv').config();
        const key = process.env.KEY_SEC;

        try {
            const decoded = jwt.verify(token, key);
            console.log(decoded.external);

            const models = require('../app/models');
            const cuenta = models.cuenta;

            const aux = await cuenta.findOne({
                where: { external_id: decoded.external }
            });

            if (!aux) {
                return res.status(401).json({ message: "ERROR", tag: 'Token no válido', code: 401 });
            }
            req.user = aux;
            next();
        } catch (err) {
            return res.status(401).json({ message: "ERROR", tag: 'Token no válido o expirado', code: 401 });
        }
    } catch (error) {
        console.error("Error en el middleware:", error);
        return res.status(500).json({ message: "Error interno del servidor", code: 500 });
    }
};

router.get('/listar/roles',middlewareAutentificacion, rolController.listar);
router.post('/guardar/roles',middlewareAutentificacion, rolController.guardar);

router.post('/iniciar_sesion', cuentaController.inicio_sesion); //
router.get('/listar/cuentas',middlewareAutentificacion, cuentaController.listar);


router.get('/listar/personas',middlewareAutentificacion, personaController.listar);
router.post('/modificar/persona/:external',middlewareAutentificacion, personaController.modificar);
router.post('/guardar/personas',middlewareAutentificacion, personaController.guardar);
router.get('/obtener/persona/:external',middlewareAutentificacion, personaController.obtener);


router.get('/listar/productos',middlewareAutentificacion, productoController.listar); //
router.post('/modificar/producto/:external',middlewareAutentificacion, productoController.modificar); //
router.post('/guardar/productos',middlewareAutentificacion, productoController.guardar); //
router.get('/obtener/productos/:external',middlewareAutentificacion, productoController.obtener); //
router.post('/darbaja/producto/:external',middlewareAutentificacion, productoController.darBaja); //

router.get('/listar/categorias',middlewareAutentificacion, categoriaController.listar); //
router.post('/modificar/categoria/:external',middlewareAutentificacion, categoriaController.modificar);
router.post('/guardar/categorias',middlewareAutentificacion, categoriaController.guardar); //
router.get('/obtener/categorias/:external',middlewareAutentificacion, categoriaController.obtener);
router.post('/darbaja/categoria/:external',middlewareAutentificacion, categoriaController.eliminarCategoria); //

router.get('/listar/resumenes',middlewareAutentificacion, resumenController.listar);
router.post('/modificar/resumen/:external',middlewareAutentificacion, resumenController.modificar);
router.post('/guardar/resumenes',middlewareAutentificacion, resumenController.guardar);
router.get('/obtener/resumen/:external',middlewareAutentificacion, resumenController.obtener);
router.post('/generar/resumen/endia',middlewareAutentificacion, resumenController.generarResumenDiario);
router.post('/generar/resumen/semanal',middlewareAutentificacion, resumenController.generarResumenSemana);

router.get('/listar/detalles',middlewareAutentificacion, detalleController.listar);
router.post('/modificar/detalle/:external',middlewareAutentificacion, detalleController.modificar);
router.post('/guardar/detalles',middlewareAutentificacion, detalleController.guardar);
router.get('/obtener/detalle/:external',middlewareAutentificacion, detalleController.obtener);
router.get('/listar/detalle/venta/:external',middlewareAutentificacion, detalleController.listarDetalleVenta);


router.get('/listar/last/ventas',middlewareAutentificacion,ventaController.listarUltimasVentas); //
router.get('/listar/ventas',middlewareAutentificacion, ventaController.listar); //
router.post('/modificar/venta/:external',middlewareAutentificacion, ventaController.modificar);
router.post('/guardar/ventas',middlewareAutentificacion, ventaController.guardar);
router.get('/obtener/venta/:external',middlewareAutentificacion, ventaController.obtener); //
router.post('/darbaja/venta/:external',middlewareAutentificacion, ventaController.darBaja);
router.post('/cambiarEstado/venta/:external',middlewareAutentificacion, ventaController.cambiarEstado);
router.post('/guardar/DetalleVenta',middlewareAutentificacion, ventaController.guardarVentaConDetalle); //
router.post('/modificar/DetalleVenta/:external',middlewareAutentificacion, ventaController.modificarVentaConDetalle);
router.post('/filtrarVentasPorFecha',middlewareAutentificacion, ventaController.filtrarVentasPorFecha);
router.get( "/listar/paginacion/ventas",middlewareAutentificacion, ventaController.listarConPaginacion);


router.post('/cambiarEstado/all/ventas',middlewareAutentificacion, ventaController.cambiarEstadoAllVentas);
module.exports = router;
