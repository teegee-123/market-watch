
export interface SafeScannerResponse {
    message: string,
    tokenName: string,
    safety: string,
    contractAddress: string,
    marketCap: number,
    liquidity: number,
    volume: number,
    volumeBuyers: number,
    volumeSellers: number,
    lockedLiquidity: number,
    ownerRenounced: boolean,
    volumeMarketCapRatio: number,
    marketCapLiquidityRatio: number,
    options: string[],    
}


