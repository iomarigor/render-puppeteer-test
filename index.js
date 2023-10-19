import express from 'express';
import { scrapingDNI } from './Controllers/DNIController.js';
import { scrapingRUC } from './Controllers/RUCController.js';
const app = express();

// Middleware para el análisis de JSON
app.use(express.json());

// Ruta para realizar web scraping
app.get('/dni',scrapingDNI);
app.get('/ruc',scrapingRUC);

// Puerto en el que escuchará la API
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
});
