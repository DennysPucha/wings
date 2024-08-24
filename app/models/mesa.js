"use strict";
module.exports = (sequelize, DataTypes) => {
  const mesa = sequelize.define('mesa', {
    numero: { type: DataTypes.INTEGER, allowNull: false },
    QRCode: { type: DataTypes.TEXT, allowNull: true },
    external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
  }, { freezeTableName: true });

  mesa.associate = function(models) {
    mesa.hasMany(models.venta, {
      foreignKey: 'id_mesa', as: 'ventas'
    });
  };

  return mesa;
};