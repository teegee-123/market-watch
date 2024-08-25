import { SafeScannerResponse, SafeScannerStrat } from "./models";

export class Strategy {
    data: SafeScannerStrat
    constructor(data: SafeScannerResponse) {
        this.data = this.runConditions(data)
    }

    private runConditions(data): SafeScannerStrat {
        return {
            ...data,
            conditions: [
                {description: 'ownerRenounced', value: this.data.ownerRenounced, met: this.data.ownerRenounced},
                {description: 'lp ratio > 15%', value: this.data.liquidityPoolRatio, met: this.data.liquidityPoolRatio > 15},
                {description: 'is in radium', value: this.data.liquidityPool, met: this.data.liquidityPool.toLowerCase().includes('raydium')},
                {description: 'holders > 100', value: this.data.holders, met: this.data.holders > 100},
                {description: 'holdersPercentages less than 20%', value: `${this.data.holderPercentages} = ${this.data.holderPercentages.reduce((partialSum, a) => partialSum + a, 0)}`, met: this.data.holderPercentages.reduce((partialSum, a) => partialSum + a, 0) < 20},
                {description: 'marketCap >= 15000', value: this.data.marketCap, met: this.data.marketCap >= 15000},
                {description: 'vol/marketCap >= 0.6', value: this.data.volumeMarketCapRatio, met: this.data.volumeMarketCapRatio >= 0.6},
                {description: 'locked >= 100', value: this.data.lockedLiquidity, met: this.data.lockedLiquidity >= 100},
            ]
        }
    }

    conditionsMet() {
        return !this.data.conditions.some(x => x.met === false)
    }

}