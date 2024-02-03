"use strict";

module.exports = (sequelize, DataTypes) => {
    const detalle = sequelize.define('detalle', {
        numero: { type: DataTypes.STRING,defaultValue: function() {const randomNum = Math.floor(10000000 + Math.random() * 90000000); return `DET${randomNum}`; }},
        cantidad: { type: DataTypes.INTEGER, defaultValue: 0 },
        producto: { type: DataTypes.STRING(200), defaultValue: "NONE" },
        precio: { type: DataTypes.DOUBLE, defaultValue: 0 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });
    detalle.associate=function(models){
        detalle.belongsTo(models.venta,{
            foreignKey:'id_venta'
        });
        
    };
    return detalle;
};