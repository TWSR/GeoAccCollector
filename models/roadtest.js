/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('roadtest', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    points: {
      type: "MULTIPOINT",
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
    acc_x: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    acc_y: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    acc_z: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    acc_xg: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    acc_yg: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    acc_zg: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    alpha: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    beta: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    gamma: {
      type: DataTypes.FLOAT,
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
    filter1: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    filter2: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'roadtest'
  });
};
