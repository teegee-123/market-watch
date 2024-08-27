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
                {description: 'isGreen', value: data.safety, met: data.safety.includes('🟢')},                
                {description: 'ownerRenounced', value: data.ownerRenounced, met: data.ownerRenounced},
                {description: 'lp ratio > 15%', value: data.liquidityPoolRatio, met: data.liquidityPoolRatio > 15},
                {description: 'is in radium', value: data.liquidityPool, met: data.liquidityPool.toLowerCase().includes('raydium')},
                {description: 'holders > 100', value: data.holders, met: data.holders > 100},
                {description: 'holdersPercentages less than 20%', value: `${data.holderPercentages} = ${data.holderPercentages.reduce((partialSum, a) => partialSum + a, 0)}`, met: data.holderPercentages.reduce((partialSum, a) => partialSum + a, 0) < 20},
                {description: 'marketCap >= 15000', value: data.marketCap, met: data.marketCap >= 15000},
                {description: 'vol/marketCap >= 0.3', value: data.volumeMarketCapRatio, met: data.volumeMarketCapRatio >= 0.3},
                {description: 'locked >= 75', value: data.lockedLiquidity, met: data.lockedLiquidity >= 75},
            ]
        }
    }

    conditionsMet() {
        return !this.data.conditions.some(x => x.met === false)
    }

}
