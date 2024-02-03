"use strict";

module.exports = (sequelize, DataTypes) => {
    const producto = sequelize.define('producto', {
        nombre: { type: DataTypes.STRING(200), defaultValue: "NONE" },
        descripcion: { type: DataTypes.STRING(300), defaultValue: "NONE" },
        costo: { type: DataTypes.DOUBLE, defaultValue: 0 },
        precio: { type: DataTypes.DOUBLE, defaultValue: 0 },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
        imagen: { type: DataTypes.STRING(300), defaultValue: "NONE" },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });
    producto.associate=function(models){
        producto.belongsTo(models.categoria,{
            foreignKey:'id_categoria', as:'categoria'
        });
        producto.belongsTo(models.persona,{
            foreignKey:'id_persona', as:'persona'
        });
    };
    return producto;
};