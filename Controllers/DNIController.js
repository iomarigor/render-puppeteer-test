
import puppeteer from 'puppeteer'; 
export const scrapingDNI = async (req, res) => {
  const { dni } = req.query;
  try {
    // Lanzar una instancia de Puppeteer
    const browser = await puppeteer.launch({
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
    });
    const page = await browser.newPage();

    // Navegar a la página "https://eldni.com/"
    await page.goto('https://eldni.com/');

    // Rellenar el campo DNI y hacer clic en el botón Buscar
    await page.type('#dni', dni); // Reemplaza con el DNI que desees consultar
    await page.click('#btn-buscar-datos-por-dni');

    // Esperar a que se cargue la página de resultados
    await page.waitForSelector('table');

    // Obtener la primera coincidencia de la etiqueta "table"
    const table = await page.$('table');
    const tbody = await table.$('tbody');
    const trs = await tbody.$$('tr');

    // Iterar a través de las etiquetas "td" de la primera fila (encabezados)
    const headerTds = await trs[0].$$('td');
    const headers = await Promise.all(headerTds.map(async (td) => {
      return await page.evaluate(element => element.textContent, td);
    }));

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

};
