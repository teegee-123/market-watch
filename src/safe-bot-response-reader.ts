import TelegramBot from "node-telegram-bot-api";
import { SafeScannerResponse } from "./models";
import { FileHandler } from "./file-handler";
import { Strategy as SafeAnalyzerStrategy } from "./safe-analyzer-strategy";

require('dotenv').config()
const environment = process.env.ENVIRONMENT
const token = process.env.SAFEBOTREADERTOKEN
function readLine(message, key) {
    return message.split(key)[1]?.split("\n")[0]?.trim() ?? ''
}
const SELECTORS = {
    contractAddressSelector: (message: any, defaultVal: any) => readLine(message, "SOL:") ?? defaultVal,
    marketCapSelector: (message: any, defaultVal: any) => readLine(message, "MCap:").split("|")[0] ?? defaultVal,
    liquiditySelector: (message: any, defaultVal: any) => readLine(message, "Liquid:").split(" ")[0] ?? defaultVal,
    volumeSelector: (message: any, defaultVal: any) => readLine(message, "Vol24h:").split("|")[0].trim() ?? defaultVal,
    volumeBuyersSelector: (message: any, defaultVal: any) => readLine(message, "Vol24h:").split("B:")[1]?.split("|")[0] ?? defaultVal,
    volumeSellersSelector: (message: any, defaultVal: any) => readLine(message, "Vol24h:").split("S:")[1]?.split("|")[0] ?? defaultVal,
    lockedLiquiditySelector: (message: any, defaultVal: any) =>  readLine(message, "LP Lock:").split("%") ?? defaultVal,
    ownerRenouncedSelector: (message: any, defaultVal: any) => !!readLine(message, "Owner:").includes("RENOUNCED") ?? defaultVal,
    optionsSelector: (message: any, defaultVal: any) => readLine(message, "Options:").split("|").map(option => option.trim()) ?? defaultVal,
    liquidityPoolRatioSelector: (message: any, defaultVal: any) =>  readLine(message, "LP Ratio:").split("in")[0] ?? defaultVal,
    liquidityPoolSelector: (message: any, defaultVal: any) => readLine(message, "LP Ratio:").split("in")[1] ?? defaultVal,
    numberOfHoldersSelector: (message: any, defaultVal: any) => readLine(message, "Holders:").split("|")[0] ?? defaultVal,
    holderPercentagesSelector: (message: any, defaultVal: any) => {
        let percentages = readLine(message, "Holders:").split("|") ?? [];
        percentages = percentages.map((x: string) => x.split("\n")[0]);
        percentages.shift()
        return percentages
    }
}




export async function startListener(logFile: FileHandler, postFile: FileHandler, errorFile: FileHandler) {
    const safeReaderBot = new TelegramBot(token);
    if(safeReaderBot.isPolling()) {
        await safeReaderBot.stopPolling({cancel: true, reason: 'starting a new listener'})
    }
    await safeReaderBot.startPolling({restart: true})
    safeReaderBot.on('message', async (msg, meta) => {
        if(msg.text?.includes('SafeAnalyzer')) {
            console.log(msg)
            try{
                const strat = new SafeAnalyzerStrategy(mapToSafeScanner(msg));
                logFile.writeFile(strat as never);
                console.log(strat.conditionsMet())
                console.log(environment)
                if(strat.conditionsMet() && environment !== "LOCAL") {
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
    const marketCapLiquidityRatio = marketCap/liquidity;
    const date = new Date();
    const title = msg.chat.title;
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
        date: date.toDateString(),
        title: title
    };
}

