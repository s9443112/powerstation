const sequelize = require('sequelize');

const config = require("../../config/config.js");


var model_map = new Map();
var model_array = [];

function log_mysql(mysql, model) {
    console.log(mysql);
}

const model = new sequelize.Sequelize(config.DB.database, config.DB.user_name, config.DB.password, {
    host: config.DB.host,     //資料庫位置
    dialect: 'mysql',         //使用mysql
    define: {
        underscored: false,
        freezeTableName: true,
        charset: 'utf8',
        timestamps: false
    },
    pool: {                   //連接池
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000
    },
    logging: process.env.MYSQL_LOG && log_mysql,
});

function helper(table_name, model_name = table_name) {
    model[model_name] = require(`./${table_name}.js`)(model, sequelize.DataTypes, model_name);
    if (!model_map.has(model_name)) {
        model_array.push(model_name);
    }
    model_map.set(model_name, model[model_name]);
}


async function sync_all() {
    try {
        for (var name of model_array) {
            await model_map.get(name).sync();
        }
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

var relative = async (table1, relationship, table2, options) => {
    await model[table1][relationship](model[table2], options);
};

helper("user")
helper("city")
helper("station")
helper("sensing_data")


relative("city", "hasMany", "station", { as: "relate_station", foreignKey: "city_id", sourceKey: "city_id" });
relative("station", "hasMany", "sensing_data", { as: "relate_sense", foreignKey: "station_id", sourceKey: "station_id" });

sync_all();

model.Op = sequelize.Op;
model.fn = sequelize.fn;
model.col = sequelize.col;
module.exports = model;
