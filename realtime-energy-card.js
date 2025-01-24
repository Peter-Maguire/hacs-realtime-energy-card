class RealtimeEnergyCard extends HTMLElement {

    costLeftToDisplay = 0;
    currentDisplayedCost = 0;
    lastRealCost = 0;
    lastFullCost = 0;
    updateInterval;


    // Whenever the state changes, a new `hass` object is set. Use this to
    // update your content.
    set hass(hass) {
        // Initialize the content if it's not there yet.
        if (!this.content) {
            this.innerHTML = `
        <ha-card>
          <div class="card-content"></div>
        </ha-card>
      `;
            this.content = this.querySelector("div");
        }

        const currentEnergyCost = hass.states[this.config.energy_cost_entity].state;
        const currentEnergyUsage = hass.states[this.config.energy_usage_entity].state;
        const currentPricePerKwh = hass.states[this.config.current_price_entity].state;
        if(parseInt(currentEnergyUsage) <= 0) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.updateContent();
            return;
        }
        //console.log("State has changed ", this.lastRealCost, currentEnergyCost)
        if(this.lastRealCost !== currentEnergyCost){
            this.lastRealCost = currentEnergyCost;
            this.currentDisplayedCost = currentEnergyCost*100;
        }

        this.costLeftToDisplay += (currentPricePerKwh * (currentEnergyUsage/1000));
        this.lastFullCost = this.costLeftToDisplay;
        if(!this.updateInterval){
            this.updateInterval = setInterval(this.updateContent.bind(this), 500);
        }
    }


    updateContent(){
        let costToAdd = this.lastFullCost/120;
        this.currentDisplayedCost += costToAdd;
        this.content.innerHTML = `<h1>${this.currentDisplayedCost.toLocaleString(undefined, {minimumFractionDigits: 10, maximumFractionDigits: 10})}p</h1>`;
        this.costLeftToDisplay -= costToAdd;
        //console.log(costToAdd, this.currentDisplayedCost, this.costLeftToDisplay)
    }


    // The user supplied configuration. Throw an exception and Home Assistant
    // will render an error card.
    setConfig(config) {
        this.config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns in masonry view
    getCardSize() {
        return 1;
    }

    // The rules for sizing your card in the grid in sections view
    // The rules for sizing your card in the grid in sections view
    getLayoutOptions() {
        return {
            grid_rows: 2,
            grid_columns: 2,
            grid_min_rows: 1,
            grid_max_rows: 3,
        };
    }
}

customElements.define("realtime-energy-card", RealtimeEnergyCard);