import {writeFileSync, readFileSync} from 'fs';

class UrlCache {

    constructor(filename) {
        this.filename = filename;
        this.cached = [];
    }

    read() {
        this.cached = JSON.parse(readFileSync(this.filename).toString());
    }

    save() {
        writeFileSync(this.filename, JSON.stringify(this.cached));
    }

    hasUrl(url) {
        return this.cached.includes(url);
    }

    addUrl(url) {
        this.cached.push(url);
    }
}

export default UrlCache;
