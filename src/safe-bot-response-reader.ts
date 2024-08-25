import TelegramBot from "node-telegram-bot-api";
import { SafeScannerResponse } from "./models";
import { FileHandler } from "./file-handler";
import { Strategy as SafeAnalyzerStrategy } from "./safe-analyzer-strategy";

require('dotenv').config()

const token = process.env.SAFEBOTREADERTOKEN

const SELECTORS = {
    contractAddressSelector: (message, defaultVal) => message.split("SOL:")[1]?.split("\n")[0]?.trim() ?? defaultVal,
    marketCapSelector: (message, defaultVal) => message.split("MCap:")[1]?.split("|")[0] ?? defaultVal,
    liquiditySelector: (message, defaultVal) => message.split("Liquid:")[1]?.trim().split(" ")[0] ?? defaultVal,
    volumeSelector: (message, defaultVal) => message.split("Vol24h:")[1]?.split("|")[0].trim() ?? defaultVal,
    volumeBuyersSelector: (message, defaultVal) => message.split("Vol24h:")[1]?.split("B:")[1]?.split("|")[0] ?? defaultVal,
    volumeSellersSelector: (message, defaultVal) => message.split("Vol24h:")[1]?.split("S:")[1]?.split("|")[0] ?? defaultVal,
    lockedLiquiditySelector: (message, defaultVal) => message.split("LP Lock:")[1]?.split("\n")[0]?.split("%") ?? defaultVal,
    ownerRenouncedSelector: (message, defaultVal) => !!message.split("Owner:")[1]?.split("\n")[0]?.includes("RENOUNCED") ?? defaultVal,
    optionsSelector: (message, defaultVal) => message.split("Options:")[1]?.split("\n")[0]?.split("|").map(option => option.trim()) ?? defaultVal,
    liquidityPoolRatioSelector: (message, defaultVal) => message.split("LP Ratio:")[1]?.split("in")[0] ?? defaultVal,
    liquidityPoolSelector: (message, defaultVal) => message.split("LP Ratio:")[1]?.split("in")[1]?.split("\n")[0] ?? defaultVal,
    numberOfHoldersSelector: (message, defaultVal) => message.split("Holders:")[1]?.split("|")[0] ?? defaultVal,
    holderPercentagesSelector: (message, defaultVal) => {
        let percentages = message.split("Holders:")[1].split("|") ?? [];
        percentages = percentages.map(x => x.split("\n")[0]);
        return percentages;
    }
}



export async function startListener(logFile: FileHandler, postFile: FileHandler) {
    const safeReaderBot = new TelegramBot(token);
    if(safeReaderBot.isPolling()) {
        await safeReaderBot.stopPolling({cancel: true, reason: 'starting a new listener'})
    }
    await safeReaderBot.startPolling({restart: true})
    safeReaderBot.on('message', async (msg, meta) => {
        if(msg.text?.includes('SafeAnalyzer')) {
            try{
                const strat = new SafeAnalyzerStrategy(mapToSafeScanner(msg));
                logFile.writeFile(strat as never);
                if(strat.conditionsMet()) {
                    await safeReaderBot.sendMessage(process.env.BUYSIGNALSCHATID, "New signal: " +strat.data.contractAddress);
                    postFile.writeFile(strat as never);
                }

            } catch(e) {
                console.log(e)
            }
        }
    });
}

export async function stopListener() {
    const safeReaderBot = new TelegramBot(token);
    await safeReaderBot.stopPolling({cancel: true, reason: 'stopped'})
    safeReaderBot.removeAllListeners();
    await safeReaderBot.close();
}



function toNumber(stringVal) {
    stringVal = stringVal.toString().trim();
    const doreplacements = (stringVal, quantifier) => stringVal.replace(quantifier, '').replace("$", '').replace(/,/g, '')   
    if(stringVal.includes("$")) {
        if(stringVal.endsWith("K")) return parseFloat(doreplacements(stringVal, "K")) * 1000
        if(stringVal.endsWith("M")) return parseFloat(doreplacements(stringVal, "M")) * 1000000
        if(stringVal.endsWith("B")) return parseFloat(doreplacements(stringVal, "B")) * 1000000000
        return parseFloat(doreplacements(stringVal, ""))
    }
    else if(stringVal.includes("%")) {
        return parseFloat(doreplacements(stringVal, "").replace("%", ""))
    } else {
        return parseFloat(doreplacements(stringVal, ""))
    }

}

function mapToSafeScanner(msg:  TelegramBot.Message): SafeScannerResponse {
    const message = msg.text;
    const lines = message.split('\n');
    const tokenName = lines[0].split("|")[1].trim();
    const safety = lines[0].split("|")[2].trim();
    const contractAddress = SELECTORS.contractAddressSelector(message, '0');
    const marketCap = toNumber(SELECTORS.marketCapSelector(message, 0));
    const liquidity = toNumber(SELECTORS.liquiditySelector(message, 0));
    const volume = toNumber(SELECTORS.volumeSelector(message, 0))
    const volumeBuyers = toNumber(SELECTORS.volumeBuyersSelector(message, 0));
    const volumeSellers = toNumber(SELECTORS.volumeSellersSelector(message, 0));
    const lockedLiquidity = toNumber(SELECTORS.lockedLiquiditySelector(message, 0));
    const ownerRenounced = SELECTORS.ownerRenouncedSelector(message, false);
    const liquidityPoolRatio = toNumber(SELECTORS.liquidityPoolRatioSelector(message, '0%'));
    const liquidityPool = SELECTORS.liquidityPoolSelector(message, 'BNB')
    const holders = toNumber(SELECTORS.numberOfHoldersSelector(message, '0'))
    const holderPercentages = SELECTORS.holderPercentagesSelector(message, []).map(x => toNumber(x))    
    const options = SELECTORS.optionsSelector(message, [])
    const volumeMarketCapRatio = volume/marketCap;
    const marketCapLiquidityRatio = marketCap/liquidity
    return {
        message: message,
        tokenName: tokenName,
        safety: safety,
        contractAddress: contractAddress,
        marketCap: marketCap,
        liquidity: liquidity,
        volume: volume,
        volumeBuyers: volumeBuyers,
        volumeSellers: volumeSellers,
        lockedLiquidity: lockedLiquidity,
        ownerRenounced: ownerRenounced,
        volumeMarketCapRatio: volumeMarketCapRatio,
        marketCapLiquidityRatio: marketCapLiquidityRatio,
        options: options,
        liquidityPoolRatio: liquidityPoolRatio,
        liquidityPool: liquidityPool,
        holders: holders,
        holderPercentages: holderPercentages,
    };
}

