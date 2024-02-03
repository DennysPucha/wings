"use strict";

module.exports = (sequelize, DataTypes) => {
    const resumen = sequelize.define('resumen', {
        numero: { type: DataTypes.STRING,defaultValue: function() {const randomNum = Math.floor(100000 + Math.random() * 900000); return `RES${randomNum}`; }},
        fecha: { type: DataTypes.DATEONLY,defaultValue: DataTypes.NOW },
        total: { type: DataTypes.DOUBLE, defaultValue: 0 },
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
    }, {freezeTableName: true });
    resumen.associate=function(models){
        resumen.belongsTo(models.persona,{
            foreignKey:'id_persona',as:'persona'
        });
    };
    return resumen;
};