"use strict";

module.exports = (sequelize, DataTypes) => {
    const categoria = sequelize.define('categoria', {
        nombre: { type: DataTypes.STRING(200) },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });

    categoria.associate=function(models){
        categoria.hasMany(models.producto,{
            foreignKey:'id_categoria', as:'producto'
        });
    };
    return categoria;
};