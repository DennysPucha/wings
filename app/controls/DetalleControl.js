"use strict";

const models = require("../models");
const { persona, rol, cuenta, sequelize, detalle, venta, producto } = models;
const uuid = require("uuid");

class DetalleControl {
  async obtener(req, res) {
    const external = req.params.external;

    try {
      const lista = await detalle.findOne({
        where: { external_id: external },
        attributes: ["numero", "cantidad", "producto", "precio", "external_id"],
      });

      if (!lista) {
        res.status(404);
        return res.json({
          message: "Detalle no encontrado",
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
      const lista = await detalle.findAll({
        attributes: ["numero", "cantidad", "producto", "precio", "external_id"],
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

  async listarDetalleVenta(req, res) {
    const external = req.params.external;
    try {
      const ventaA = await venta.findOne({ where: { external_id: external } });
      const lista = await detalle.findAll({
        where: { id_venta: ventaA.id },
        attributes: ["numero", "cantidad", "producto", "precio", "external_id"],
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
    const { cantidad, producto: productoId, venta: ventaId } = req.body;

    if (cantidad && productoId && ventaId) {
      try {
        const ventaA = await venta.findOne({ where: { external_id: ventaId } });
        if (!ventaA) {
          res.status(404);
          return res.json({
            message: "Venta no encontrada",
            code: 404,
            data: {},
          });
        }
        const productoA = await producto.findOne({
          where: { external_id: productoId },
        });
        if (!productoA) {
          res.status(404);
          return res.json({
            message: "Producto no encontrado",
            code: 404,
            data: {},
          });
        }
        const precioAlt = productoA.precio * cantidad;
        const data = {
          cantidad: cantidad,
          producto: productoA.nombre,
          precio: precioAlt,
          id_venta: ventaA.id,
          external_id: uuid.v4(),
        };
        const result = await detalle.create(data);
        if (!result) {
          res.status(401);
          return res.json({
            message: "ERROR",
            tag: "No se puede crear",
            code: 401,
          });
        }
        const subdata = {
          subtotal: ventaA.subtotal + precioAlt,
          total: ventaA.total + precioAlt,
        };

        const result2 = await ventaA.update(subdata, {
          where: { external_id: ventaId },
        });
        if (!result2) {
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
    const { cantidad, producto: productoId, venta: ventaId } = req.body;
    if (cantidad && productoId && ventaId) {
      try {
        const ventaA = await venta.findOne({ where: { external_id: ventaId } });
        if (!ventaA) {
          res.status(404);
          return res.json({
            message: "Venta no encontrada",
            code: 404,
            data: {},
          });
        }
        const productoA = await producto.findOne({
          where: { external_id: productoId },
        });
        if (!productoA) {
          res.status(404);
          return res.json({
            message: "Producto no encontrado",
            code: 404,
            data: {},
          });
        }
        const precioAlt = productoA.precio * cantidad;
        const detalleA = await detalle.findOne({
          where: { external_id: external },
        });

        if (!detalleA) {
          res.status(404);
          return res.json({
            message: "Detalle no encontrado",
            code: 404,
            data: {},
          });
        }

        const data = {
          cantidad: cantidad,
          producto: productoA.nombre,
          precio: precioAlt,
          id_venta: ventaA.id,
          external_id: uuid.v4(),
        };
        const result = await detalleA.update(data, {
          where: { external_id: external },
        });
        if (!result) {
          res.status(401);
          return res.json({
            message: "ERROR",
            tag: "No se puede modificar",
            code: 401,
          });
        }
        const subdata = {
          subtotal: ventaA.subtotal + precioAlt,
          total: ventaA.total + precioAlt,
        };

        const result2 = await ventaA.update(subdata, {
          where: { external_id: ventaId },
        });
        if (!result2) {
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
}
module.exports = DetalleControl;
