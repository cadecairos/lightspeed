import fuzzy from 'fuzzy'

const { tabs, runtime, windows } = browser;

class FastTabIndex {
    constructor() {
        this.tabMap =  new Map();

        tabs.onCreated.addListener((...args) => this.addTab(...args));
        tabs.onUpdated.addListener((...args) => this.onUpdated(...args));
        tabs.onRemoved.addListener((...args) => this.onRemoved(...args));

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
        if (this.tabMap.has(tab.id)) {
            return;
        }

        this.tabMap.set(tab.id, this.formatTab(tab));
    }

    onUpdated(tabId, changeInfo, tab) {
        if (!this.tabMap.has(tabId)) {
            return;
        }

        if (!changeInfo.url && !changeInfo.title) {
            return;
        }

        this.tabMap.set(tabId, this.formatTab(tab));
    }

    onRemoved(tabId) {
        if (!this.tabMap.has(tabId)) {
            return;
        }

        this.tabMap.delete(tabId);
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

(new FastTabIndex()).init();
