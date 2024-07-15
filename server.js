const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { FavoritePair } = require('./index'); // Ensure this path is correct

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Route to save favorite currency pair
app.post('/favorites', async (req, res) => {
    try {
        const { baseCurrency, targetCurrency } = req.body;
        if (!baseCurrency || !targetCurrency) {
            return res.status(400).json({ error: 'Base currency and target currency are required.' });
        }
        const favoritePair = await FavoritePair.create({ baseCurrency, targetCurrency });
        res.status(201).json(favoritePair);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to get all favorite currency pairs
app.get('/favorites', async (req, res) => {
    try {
        const favoritePairs = await FavoritePair.findAll();
        res.json(favoritePairs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to delete a favorite currency pair
app.delete('/favorites', async (req, res) => {
    try {
        const { baseCurrency, targetCurrency } = req.body;
        if (!baseCurrency || !targetCurrency) {
            return res.status(400).json({ error: 'Base currency and target currency are required.' });
        }
        const result = await FavoritePair.destroy({
            where: { baseCurrency, targetCurrency }
        });
        if (result) {
            res.status(200).json({ message: 'Favorite pair deleted successfully.' });
        } else {
            res.status(404).json({ error: 'Favorite pair not found.' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
