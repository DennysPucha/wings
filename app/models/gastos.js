"use strict";

module.exports = (sequelize, DataTypes) => {
    const gasto = sequelize.define('gasto', {
        fecha: { type: DataTypes.DATEONLY,defaultValue: DataTypes.NOW },
        detalle: { type: DataTypes.STRING(200), defaultValue: "NONE" },
        total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });

    return gasto;
};