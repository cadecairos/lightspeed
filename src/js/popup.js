const {
    tabs,
    runtime,
    windows
} = browser;

class FastTab {
    constructor() {
        this._searchBox = document.querySelector('#search-box');
        this._resultsDiv = document.querySelector('#results-div');
        this._selectedIndex = 0;

        this._searchBox.addEventListener('input', () => this.searchTabs());
        this._searchBox.addEventListener('keyup', (...args) => this.processKeyUp(...args));

        // hack to focus popup window and search box
        setTimeout(() => {
          document.querySelector('body').focus();
          setTimeout(() => {
            this._searchBox.focus();
          }, 0)
        }, 50);

        this.searchTabs();
    }

    set selectedIndex(newValue) {
        const resultsLength = this._searchableTabs.length;

        if (resultsLength === 0) {
            return;
        }

        const lastIndex = this._selectedIndex;
        this._selectedIndex = newValue;

        // Selection wrapping
        if (this.selectedIndex < 0) {
            this._selectedIndex = resultsLength - 1;
        } else if (this.selectedIndex === resultsLength) {
            this._selectedIndex = 0
        }

        this._searchableTabs[lastIndex]._div.classList.remove('selected');
        this._searchableTabs[this.selectedIndex]._div.classList.add('selected');
    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    set searchableTabs(tabs) {
        this._searchableTabs = tabs;
        this.clear();

        if (!this._searchableTabs.length) {
            console.log("No Searchable Tabs");
            return;
        }

        this._searchableTabs.forEach((...args) => this.renderTab(...args));
        this.selectedIndex = 0;
    }

    async switchToSelectedTab() {
        const {id, windowId} = this._searchableTabs[this.selectedIndex];
        try {
            await tabs.update(id, {
                active: true
            })

            if(windows.WINDOW_ID_CURRENT === windowId){
                return Promise.resolve();
            }

            await windows.update(windowId, { focused: true });

            window.close();
        } catch (error) {
            console.error(`Error switching tabs: ${error}`);
        }
    }

    processKeyUp(event) {
        switch(event.key) {
            case "ArrowUp":
                this.selectedIndex--;
                break;
            case "ArrowDown":
                this.selectedIndex++
                break;
            case "Enter":
                this.switchToSelectedTab();
                break;
            case "Escape":
                window.close();
                break;
        }
    }

    async searchTabs() {
        this.searchableTabs = await runtime.sendMessage(this._searchBox.value);
    }

    clear() {
        while(this._resultsDiv.firstChild) {
            this._resultsDiv.removeChild(this._resultsDiv.firstChild);
        }
    }

    renderTab(tab, index) {
        const tabDiv = document.createElement('div');
        tabDiv.classList.add('result-item');
        tabDiv.textContent = tab.title;
        tabDiv.setAttribute('data-tab-id', tab.id);
        this._resultsDiv.appendChild(tabDiv);
        this._searchableTabs[index]._div = tabDiv;
    }
}

document.addEventListener('DOMContentLoaded', () => new FastTab());
