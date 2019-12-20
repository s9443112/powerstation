module.exports = function (sequelize, DataTypes) {
    return sequelize.define('user', {
        user_id: {
            type: DataTypes.INTEGER(11),
            comment: '會員流水號',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        user_uuid:{
            type: DataTypes.UUID,
            comment: '會員uuid',
            allowNull: false
        },
        user_identify:{
            type: DataTypes.INTEGER(11),
            comment: '會員權限',
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