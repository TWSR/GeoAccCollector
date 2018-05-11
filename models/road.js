/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('road', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        vehicle_type: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        time: {
            type: DataTypes.DATE,
            allowNull: true
        },
        points: {
            type: "LINESTRING",
            allowNull: true
        },
        smooth_index: {
            type: "DOUBLE",
            allowNull: true
        },
        latlng: {
            type: "POINT",
            allowNull: true
        },
        img: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        uuid: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        source: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        filter_std_all: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        filter2: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0'
        },
        user: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        remark: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        roadcol: {
            type: DataTypes.STRING(45),
            allowNull: true
        }
    }, {
        tableName: 'road'
    });
};