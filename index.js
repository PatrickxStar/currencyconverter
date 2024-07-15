const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize for SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

// Define the FavoritePair model
const FavoritePair = sequelize.define('FavoritePair', {
    baseCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    targetCurrency: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Sync the model with the database
sequelize.sync()
    .then(() => {
        console.log('Database & tables created!');
    });

module.exports = { FavoritePair };
