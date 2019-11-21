module.exports = function (sequelize, DataTypes) {
    return sequelize.define('sensing_data', {
        sense_id: {
            type: DataTypes.INTEGER(11),
            comment: '流水號',
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        station_id: {
            type: DataTypes.INTEGER(11),
            comment: '發電廠ID',
            allowNull: false
        },
        hot_water_temp: {
            type: DataTypes.FLOAT(25,3),
            comment: '熱水溫度',
            allowNull: false
        },
        cold_water_temp: {
            type: DataTypes.FLOAT(25,3),
            comment: '冷水溫度',
            allowNull: false
        },
        cold_water_temp2: {
            type: DataTypes.FLOAT(25,3),
            comment: '冷水溫度2',
            allowNull: false
        },

        vol: {
            type: DataTypes.FLOAT(25,3),
            comment: '電壓',
            allowNull: false
        },
        current: {
            type: DataTypes.FLOAT(25,3),
            comment: '電流',
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
        createdAt: "create_at",
        updatedAt: false
    });
};