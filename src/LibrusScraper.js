import puppeteer from 'puppeteer';
import {EventEmitter} from 'events';

class LibrusScraper extends EventEmitter {

    constructor(username, password, cache) {
        super();

        this.username = username;
        this.password = password;
        this.cache = cache;
    }

    async scrape() {
        console.log(`Scraper is running`);

        let browser = await puppeteer.launch();
        let page = await browser.newPage();

        await page.goto('http://aplikacje.edukacja.gorzow.pl/');

        await page.type('#Username', this.username);
        await page.type('#Password', this.password);

        await page.click('button[type=submit]');
        await page.waitForNavigation();

        await page.click('a[href$=gorzow_wlkp]');
        await page.waitForNavigation();

        await page.waitFor(3000);
        await page.click('input[value=OK]');

        await page.click('#icon-wiadomosci');
        await page.waitFor(1000);

        let messageUrls = await page.evaluate(() => {
            return [...document.querySelectorAll('tr[class^=line] td:nth-child(4) a')]
                .map(element => element.href);
        });

        let newMessageUrls = messageUrls.filter(url => !this.cache.hasUrl(url));

        console.log(`Scraper has found ${messageUrls.length} message url's (${newMessageUrls.length} new)`);

        for (let newMessageUrl of newMessageUrls) {
            await page.goto(newMessageUrl);
            await page.waitFor(1000);

            let message = await page.evaluate(() => {
                let elementBody = document.querySelector(
                    '#formWiadomosci > div > div > table > tbody > tr > td:nth-child(2)'
                );

                return {
                    url: window.location.href,
                    from: elementBody.querySelector('tr:nth-child(1) td:nth-child(2)').innerText,
                    title: elementBody.querySelector('tr:nth-child(2) td:nth-child(2)').innerText,
                    sent: elementBody.querySelector('tr:nth-child(3) td:nth-child(2)').innerText,
                    content: document.querySelector('.container-message-content').innerText
                };
            });

            this.cache.addUrl(newMessageUrl);
            this.emit('message', message);
        }

        this.cache.save();
        await browser.close();
    }

}

export default LibrusScraper;
