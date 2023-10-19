import express from 'express';
import puppeteer from 'puppeteer';
//import { scrapingDNI } from './Controllers/DNIController.js';
//import { scrapingRUC } from './Controllers/RUCController.js';
const app = express();

// Middleware para el análisis de JSON
app.use(express.json());

// Ruta para realizar web scraping
//app.get('/dni',scrapingDNI);
//app.get('/ruc',scrapingRUC);
app.get('/',(req,res)=>{
    res.send('Puppeteer web scraping SUNAT / RENIEC');
});
app.get('/dni', async (req, res) => {
    const { dni } = req.query;
    try {
      console.log('DNI START', dni);
      // Lanzar una instancia de Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
          ],
          executablePath:
            process.env.NODE_ENV === "production"
              ? process.env.PUPPETEER_EXECUTABLE_PATH
              : puppeteer.executablePath(),
        /* executablePath: '/usr/bin/chromium-browser',
        args: ["--disable-notifications", "--no-sandbox"] */
      });
      const page = await browser.newPage();
  
      // Navegar a la página "https://eldni.com/"
      
      await page.goto('https://eldni.com/');
      console.log('1');
      await page.waitForNavigation();

      // Rellenar el campo DNI y hacer clic en el botón Buscar
      await page.type('#dni', dni); // Reemplaza con el DNI que desees consultar
      console.log('2');

      await page.click('#btn-buscar-datos-por-dni');
      console.log('3');

      await page.waitForNavigation();

      // Esperar a que se cargue la página de resultados
      await page.waitForSelector('table');
      console.log('4');
  
      // Obtener la primera coincidencia de la etiqueta "table"
      const table = await page.$('table');
      console.log('5');

      const tbody = await table.$('tbody');
      console.log('6');

      const trs = await tbody.$$('tr');
      console.log('7');

  
      // Iterar a través de las etiquetas "td" de la primera fila (encabezados)
      const headerTds = await trs[0].$$('td');
      console.log('8');

      const headers = await Promise.all(headerTds.map(async (td) => {
        return await page.evaluate(element => element.textContent, td);
      }));
      console.log('9');
  
      // Cerrar el navegador
      await browser.close();
      res.send({
        is_error: false,
        dni: headers[0],
        nombres: headers[1],
        ape_paterno: headers[2],
        ape_materno: headers[3],
        error: null
      });
    } catch (error) {
      res.status(500).send({
        is_error: true,
        dni: null,
        nombres: null,
        ape_paterno: null,
        ape_materno: null,
        error: 'Error en el web scraping: ' + error.message
      });
    }
  });
  app.get('/ruc', async (req, res) => {
    const { ruc } = req.query;
    try {
      console.log('RUC START', ruc);
      // Lanzar una instancia de Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
          ],
          executablePath:
            process.env.NODE_ENV === "production"
              ? process.env.PUPPETEER_EXECUTABLE_PATH
              : puppeteer.executablePath(),
        /* executablePath: '/usr/bin/chromium-browser',
        args: ["--disable-notifications", "--no-sandbox"] */
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
      // Navegar a la página de SUNAT
      await page.goto('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp');
      await page.waitForNavigation();

      // Rellenar el campo RUC y hacer clic en el botón Aceptar
      await page.type('#txtRuc', ruc);  // Reemplaza 'Número de RUC' con el RUC que desees consultar
      await page.click('#btnAceptar');
      await page.waitForNavigation();

      // Esperar a que se cargue la página de resultados
      await page.waitForSelector('.list-group-item-heading');
  
      // Obtener las coincidencias de las etiquetas h4
      const headings = await page.$$('.list-group-item-heading');
      const secondHeading = await headings[1].evaluate((heading) => heading.textContent);
  
      // Obtener las coincidencias de las etiquetas p
      const texts = await page.$$('.list-group-item-text');
      const sixthText = await texts[4].evaluate((text) => text.textContent);
  
      // Cerrar el navegador
      await browser.close();
  
      res.send({
        is_error: false,
        ruc: secondHeading.split(' - ')[0],
        razon_social: secondHeading.split(' - ')[1],
        es_activo: (sixthText.replaceAll(/\s/g, '') == "ACTIVO") ? true : false,
        error: null
      });
    } catch (error) {
      res.status(500).send({
        is_error: true,
        ruc: null,
        razon_social: null,
        es_activo: null,
        error: 'Error en el web scraping: ' + error.message
      });
    }
  });
// Puerto en el que escuchará la API
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`API escuchando en el puerto ${port}`);
});
