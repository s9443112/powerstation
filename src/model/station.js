module.exports = function (sequelize, DataTypes) {
    return sequelize.define('station', {
        station_id: {
            type: DataTypes.INTEGER(11),
            comment: '發電廠ID',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        city_id:{
            type: DataTypes.INTEGER(11),
            comment: '城市ID',
            allowNull: false
        },
        station_name:{
            type: DataTypes.STRING(15),
            comment: '發電廠名稱',
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            comment: '備註',
            allowNull: true
        }
    }, {
        freezeTableName: true,
        timestamps: true,
        createdAt: false,
        updatedAt: false
    });
};