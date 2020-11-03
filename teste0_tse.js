const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://divulgacandcontas.tse.jus.br/divulga/#/municipios/2020/2030402020/62197/candidatos');

    const resultsSelector = '.table';
    await page.waitForSelector(resultsSelector);
    await page.waitForSelector('.table td');

    // Extract the results from the page.
    const dataCells = await page.evaluate((resultsSelector) => {
        const stringCell = (html) => html.textContent || html.innerText || "";

        const thead = Array.from(document.querySelectorAll(`${resultsSelector} thead`))
        const trows = Array.from(document.querySelectorAll(`${resultsSelector} tr`))

        const tableHead = thead.map(head => (Array.from(head.querySelectorAll('th')).map(cell => stringCell(cell) )))
        const tableRows = trows.map(row => (Array.from(row.querySelectorAll('td')).map(cell => stringCell(cell) )))

        return tableHead.concat(tableRows)
    }, resultsSelector);

    //exportar para json/xls
    console.log(dataCells);
    let csvContent = ''
    dataCells.forEach(function(rowArray) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    }); 

    console.log(csvContent);

    fs.writeFile("./test.csv", csvContent, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });

    await browser.close();
})();