import {Client, RichEmbed} from 'discord.js';
import UrlCache from './UrlCache';
import LibrusScraper from './LibrusScraper';

class LibrusBot {

    constructor() {
        this.bot = new Client();
        this.urlCache = new UrlCache('urls.json');
        this.scraper = new LibrusScraper(process.env.LIBRUS_USERNAME, process.env.LIBRUS_PASSWORD, this.urlCache);
    }

    runScrape() {
        this.scraper.scrape()
            .catch(e => console.error(`Exception occurred during scraping: ${e.message}`));
    }

    onBotReady() {
        this.announcmentChannel = this.bot.channels.get(process.env.ANNOUNCMENT_CHANNEL_ID);

        this.runScrape();
        setInterval(this.runScrape.bind(this), 10 * 60 * 1000);
    }

    onNewMessage({url, from, title, sent, content}) {
        let message = new RichEmbed()
            .setColor('#ff9ee0')

            .setAuthor(from.substr(0, 256))
            .setTitle(title.substr(0, 256))

            .setDescription(content.substr(0, 2048))

            .setFooter(sent)
            .setURL(url);

        this.announcmentChannel.send(message);
    }

    run() {
        this.urlCache.read();
        this.bot.login(process.env.DISCORD_TOKEN)
            .catch(e => console.error(`Exception occurred while attempting to login: ${e.message}`));

        this.bot.on('ready', this.onBotReady.bind(this));
        this.scraper.on('message', this.onNewMessage.bind(this));
    }

}

export default LibrusBot;
