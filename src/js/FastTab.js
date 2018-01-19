import Fuse from './external/fuse.min.js';

const {
    tabs,
    runtime,
    windows,
    commands,
} = browser;

class FastTab {
    constructor() {
        this._fuseOptions = {
            shouldSort: true,
            minMatchCharLength: 4,
            threshhold: 0.3,
            distance: 100,
            maxPatternLength: 30,
            keys: [
                'title',
                'url'
            ]
        };

        this._tabIndex = [];
        this._indexedTabsQuery = {
            currentWindow: true,
        };

        this._searchBox = document.querySelector('#search-box');
        this._resultsDiv = document.querySelector('#results-div');
    }

    indexTab(tab) {
        const {id, title, url} = tab;
        this._tabIndex.push(tab);
    }

    async indexTabs() {
        const browserTabs = await tabs.query(this._indexedTabsQuery);
        for (const tab of browserTabs) {
            this.indexTab(tab);
        }
    }

    switchToTab(tabId) {
        tabs.update(tabId, {
            active: true
        });
    }

    searchTabs() {
        if (!this._tabsIndexed) {
            return;
        }

        const results = this._fuse.search(this._searchBox.value);

        this.display(results);
    }

    clear() {
        while(this._resultsDiv.firstChild) {
            this._resultsDiv.removeChild(this._resultsDiv.firstChild);
        }
    }

    addResult(tab) {
        const tabHit = document.createElement('div');
        tabHit.classList.add('result-item');
        tabHit.textContent = tab.title;
        tabHit.setAttribute('data-tab-id', tab.id);
        this._resultsDiv.appendChild(tabHit);
    }

    display(results) {
        this.clear();

        if (!results.length) {
            console.log("No results");
            return;
        }

        for(const tab of results) {
            this.addResult(tab);
        }
    }


    async init() {
        this._searchBox.addEventListener('input', () => this.searchTabs());
        await this.indexTabs();
        this._fuse = new Fuse(this._tabIndex, this._fuseOptions);
        this._tabsIndexed = true;
    }
}

document.addEventListener('DOMContentLoaded', () => (new FastTab()).init());
