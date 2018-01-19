import JsSearch from 'js-search'

const { tabs, runtime } = browser;

class FastTabIndex {
    constructor() {
        this.jsSearch = null;

        tabs.onCreated.addListener(() => this.updateSearchIndex());
        tabs.onAttached.addListener(() => this.updateSearchIndex());
        tabs.onUpdated.addListener(() => this.updateSearchIndex());
        tabs.onRemoved.addListener(() => this.updateSearchIndex());

        browser.runtime.onMessage.addListener((...args) => {
            this.searchIndex(...args);
        });
    }

    getTabs() {
        return tabs.query({currentWindow: true});
    }

    async updateSearchIndex() {
        this.jsSearch = new JsSearch.Search('url');
        this.jsSearch.addIndex('title');
        this.jsSearch.addDocuments(await this.getTabs());
    }

    searchIndex(searchText, sender, sendResponse) {
        sendResponse(this.jsSearch.search(searchText));
    }

    init() {
        this.updateSearchIndex();
    }
}

(new FastTabIndex()).init();
