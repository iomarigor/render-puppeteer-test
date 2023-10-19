
import puppeteer from 'puppeteer';

export const scrapingRUC = async (req, res) => {
    const { ruc } = req.query;
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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
        //await new Promise(resolve => setTimeout(resolve, 2000));
        // Navegar a la página de SUNAT
        await page.goto('https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp');

        // Rellenar el campo RUC y hacer clic en el botón Aceptar
        await page.type('#txtRuc', ruc);  // Reemplaza 'Número de RUC' con el RUC que desees consultar
        await page.click('#btnAceptar');

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

};