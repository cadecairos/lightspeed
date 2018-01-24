import fuzzy from 'fuzzy'

const { tabs, runtime, windows } = browser;

class LightspeedIndex {
    constructor() {
        this.tabMap =  new Map();

        tabs.onCreated.addListener((...args) => this.addTab(...args));
        tabs.onUpdated.addListener((...args) => this.onUpdated(...args));
        tabs.onRemoved.addListener(tabId => this.tabMap.delete(tabId));

        browser.runtime.onMessage.addListener((...args) => {
            this.searchIndex(...args);
        });
    }

    get fuzzyOptions() {
        return { extract: (tab) => tab.title };
    }

    get tabMapValueArray() {
        return Array.from(this.tabMap.values());
    }

    formatTab({id, url, title, windowId}) {
        return {id, url, title, windowId};
    }

    addTab(tab) {
        if (!this.tabMap.has(tab.id)) {
            this.tabMap.set(tab.id, this.formatTab(tab));
        }

    }

    onUpdated(tabId, changeInfo, tab) {
        if (changeInfo.url || changeInfo.title) {
            this.tabMap.set(tabId, this.formatTab(tab));
        }
    }

    searchIndex(searchText, sender, sendResponse) {
        if (searchText === '') {
            return sendResponse(this.tabMapValueArray);
        }

        sendResponse(fuzzy.filter(
            searchText,
            this.tabMapValueArray,
            this.fuzzyOptions
        ).map(match => match.original));
    }

    async init() {
        const currentTabs = await tabs.query({});
        for(const tab of currentTabs) {
            this.tabMap.set(tab.id, this.formatTab(tab));
        }
    }
}

(new LightspeedIndex()).init();
