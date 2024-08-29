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
var clientesRouter = require ('./clientes')


const personaController = new PersonaController();
const rolController = new RolController();
const cuentaController = new CuentaController();
const productoController = new ProductoController();
const categoriaController = new CategoriaController();
const resumenController = new ResumenController();
const detalleController = new DetalleController();
const ventaController = new VentaController();

router.use('/clientes', clientesRouter)

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

router.get('/listar/roles', rolController.listar);
router.post('/guardar/roles', rolController.guardar);

router.post('/iniciar_sesion', cuentaController.inicio_sesion); //
router.get('/listar/cuentas', cuentaController.listar);


router.get('/listar/personas', personaController.listar);
router.post('/modificar/persona/:external', personaController.modificar);
router.post('/guardar/personas', personaController.guardar);
router.get('/obtener/persona/:external', personaController.obtener);


router.get('/listar/productos', productoController.listar); //
router.post('/modificar/producto/:external', productoController.modificarProductoConImagen); //
router.post('/guardar/productos', productoController.guardarProductoConImagen); //
router.get('/obtener/productos/:external', productoController.obtener); //
router.post('/darbaja/producto/:external', productoController.darBaja); //
//router.post('/guardar/productosConImagen', productoController.guardarProductoConImagen); //

router.get('/listar/categorias', categoriaController.listar); //
router.post('/modificar/categoria/:external', categoriaController.modificar);
router.post('/guardar/categorias', categoriaController.guardar); //
router.get('/obtener/categorias/:external', categoriaController.obtener);
router.post('/darbaja/categoria/:external', categoriaController.eliminarCategoria); //

router.get('/listar/resumenes', resumenController.listar);
router.post('/modificar/resumen/:external', resumenController.modificar);
router.post('/guardar/resumenes', resumenController.guardar);
router.get('/obtener/resumen/:external', resumenController.obtener);
router.post('/generar/resumen/endia', resumenController.generarResumenDiario);
router.post('/generar/resumen/semanal', resumenController.generarResumenSemana);

router.get('/listar/detalles', detalleController.listar);
router.post('/modificar/detalle/:external', detalleController.modificar);
router.post('/guardar/detalles', detalleController.guardar);
router.get('/obtener/detalle/:external', detalleController.obtener);
router.get('/listar/detalle/venta/:external', detalleController.listarDetalleVenta);


router.get('/listar/last/ventas',ventaController.listarUltimasVentas); //
router.get('/listar/ventas', ventaController.listar); //
router.post('/modificar/venta/:external', ventaController.modificar);
router.post('/guardar/ventas', ventaController.guardar);
router.get('/obtener/venta/:external', ventaController.obtener); //
router.post('/darbaja/venta/:external', ventaController.darBaja);
router.post('/cambiarEstado/venta/:external', ventaController.cambiarEstado);
router.post('/guardar/DetalleVenta', ventaController.guardarVentaConDetalle); //
router.post('/modificar/DetalleVenta/:external', ventaController.modificarVentaConDetalle);
router.post('/filtrarVentasPorFecha', ventaController.filtrarVentasPorFecha);
router.get( "/listar/paginacion/ventas", ventaController.listarConPaginacion);


router.post('/cambiarEstado/all/ventas', ventaController.cambiarEstadoAllVentas);


// rolController.iniciarTareaPeriodica();

module.exports = router;
