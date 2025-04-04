"use strict";

module.exports = (sequelize, DataTypes) => {
    const venta = sequelize.define('venta', {
        numero: { type: DataTypes.STRING,defaultValue: function() {const randomNum = Math.floor(10000000 + Math.random() * 90000000); return `VENTA${randomNum}`; }},
        fecha: { type: DataTypes.DATEONLY,defaultValue: DataTypes.NOW },
        hora: { type: DataTypes.TIME,defaultValue: DataTypes.NOW },
        subtotal: { type: DataTypes.DOUBLE, defaultValue: 0 },
        total: { type: DataTypes.DOUBLE, defaultValue: 0 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        metodo: { type: DataTypes.ENUM(['Transferencia','Efectivo','Tarjeta de credito']), defaultValue:"Efectivo"},
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });
    venta.associate=function(models){
        venta.hasMany(models.detalle,{
            foreignKey:'id_venta',as:'detalle'
        });
        venta.belongsTo(models.persona,{
            foreignKey:'id_persona',as:'persona'
        });

    };
    return venta;
};