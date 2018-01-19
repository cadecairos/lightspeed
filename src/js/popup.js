const {
    tabs,
    runtime,
} = browser;

class FastTab {
    constructor() {
        this._searchBox = document.querySelector('#search-box');
        this._resultsDiv = document.querySelector('#results-div');

        this._searchBox.addEventListener('input', () => this.searchTabs());

        setTimeout(() => {
          document.querySelector('body').focus();
          setTimeout(() => {
            this._searchBox.focus();
          }, 0)
        }, 0);
    }

    switchToTab(tabId) {
        tabs.update(tabId, {
            active: true
        });
    }

    async searchTabs() {
        this.display(await runtime.sendMessage(this._searchBox.value));
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
}

document.addEventListener('DOMContentLoaded', () => new FastTab());
