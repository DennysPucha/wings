'use strict';

const express = require('express');
const clientes = express.Router();

const MesaController = require('../app/controls/MesaControl');

const mesaController = new MesaController();

clientes.get('/mesa', mesaController.listar);
clientes.get('/mesa/:external', mesaController.obtener);
clientes.post('/mesa', mesaController.guardar);
clientes.put('/mesa/:external', mesaController.modificar);
clientes.post('/mesa/generarVenta/:external', mesaController.guardarVentaMesa);
clientes.put('/mesa/modificarVenta/:external', mesaController.modificarVentaMesa);
clientes.get('/mesa/ventas/:external', mesaController.listarVentaMesa);
clientes.delete('/mesa/ventas/:external', mesaController.eliminarVentaMesa);
clientes.get('/mesa/:external_mesa/venta/:external_venta', mesaController.obtenerVentaMesa);

module.exports = clientes