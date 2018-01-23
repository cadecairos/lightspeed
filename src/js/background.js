import fuzzy from 'fuzzy'

const { tabs, runtime, windows } = browser;

class FastTabIndex {
    constructor() {
        // TODO: Per Window TabMaps
        this.tabMap =  new Map();

        tabs.onCreated.addListener((...args) => this.addTab(...args));
        tabs.onAttached.addListener((...args) => this.onAttached(...args));
        tabs.onDetached.addListener((...args) => this.onDetached(...args));
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

    formatTab({id, url, title}) {
        return {id, url, title};
    }

    addTab(tab) {
        if (this.tabMap.has(tab.id)) {
            return;
        }

        this.tabMap.set(tab.id, this.formatTab(tab));
    }

    async onAttached(tabId, attachInfo) {
        if (this.tabMap.has(tabId)) {
            return;
        }

        const tab = await tabs.get(tabId);

        if (!tab || tab.windowId !== windows.WINDOW_ID_CURRENT) {
            return;
        }

        this.tabMap.set(tab.id, this.formatTab(tab));
    }

    onDetached(tabId) {
        if (this.tabMap.has(tabId)) {
            this.tabMap.delete(tabId);
        }
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
        sendResponse(fuzzy.filter(
            searchText,
            this.tabMapValueArray,
            this.fuzzyOptions
        ).map(match => match.original));
    }

    async init() {
        const currentTabs = await tabs.query({ currentWindow: true });
        for(const tab of currentTabs) {
            this.tabMap.set(tab.id, this.formatTab(tab));
        }
    }
}

(new FastTabIndex()).init();
