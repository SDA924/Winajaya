const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'employee',
    },
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id'
        }
    }
}, {
    tableName: 'users',
    timestamps: true
});

module.exports = User;