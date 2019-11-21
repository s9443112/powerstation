module.exports = function (sequelize, DataTypes) {
    return sequelize.define('city', {
        city_id: {
            type: DataTypes.INTEGER(11),
            comment: '城市ID',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        city_name:{
            type: DataTypes.STRING(15),
            comment: '城市名稱',
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