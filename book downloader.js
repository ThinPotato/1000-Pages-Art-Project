const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let text = []
    let title = []
    let book = {}
    let count = 0
    try {
        await page.goto('https://recommendmeabook.com/', { timeout: 1800000 });
        for (let i = 0; i < 1000; i++) {
            await page.waitForTimeout(1000)
            page.evaluate(_ => {
                window.scrollBy(0, 90000);
              });
            const [button] = await page.$x("//button[contains(., 'Next Book')]");
            await page.waitForTimeout(1000)
            const [titleButton] = await page.$x("//button[contains(., 'Reveal Title & Author')]");
            if (titleButton)
                await titleButton.click()
            
            await page.waitForTimeout(1000)
            let bodyHTML = await page.evaluate(() => document.body.innerHTML);
            let $ = cheerio.load(bodyHTML);
            fs.writeFileSync('tmp.html', bodyHTML);
            let manyP = $('.Page_text__3G9Sy > p')
            let bookTitle = $('.Info_info__sYZUY').children('h3').text()
            manyP.each((index, element) => {

                text.push($(element).text())
                book[count] = text
            });
            title.push(bookTitle)
            console.log("Book: " +count + " downloaded")
            console.log("Title: " + bookTitle)
            await fs.writeFileSync('books.json', JSON.stringify(book));
            await fs.writeFileSync('bookTitles.json', JSON.stringify(title));

            page.evaluate(_ => {
                window.scrollBy(0, -90000);
                });
            await page.waitForTimeout(1000)

            if (button) {
                text = []
                await button.click();
                count += 1
            }
        }
    } catch (err) {
        console.log(err);
    }

    await browser.close();
    console.log("finished")
})();