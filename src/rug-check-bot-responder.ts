import { get, request } from "http";
import TelegramBot, { TelegramEvents } from "node-telegram-bot-api";
import fetch from 'node-fetch';

require('dotenv').config()
const environment = process.env.ENVIRONMENT

function readLine(message, key) {
    return message.split(key)[1]?.split("\n")[0]?.trim() ?? ''
}

export async function startRugListener(rugcheckbot: TelegramBot) {        
    if(rugcheckbot.isPolling()) {        
        await rugcheckbot.removeAllListeners('message')
        await rugcheckbot.stopPolling({cancel: true, reason: 'starting a new listener'})
    }
    await rugcheckbot.startPolling({restart: true})
    console.log("started")
    // await rugcheckbot.sendMessage(process.env.BUYSIGNALSCHATID,  `Started rugcheck bot service ${new Date()} ON ${environment}`);

    rugcheckbot.on('message', async (msg, meta) => {
        const addresses = msg.text?.match("[A-Za-z0-9]{44}") 
        if(addresses.length){
            const address = addresses[0]
            try{
                console.log(`http://api.rugcheck.xyz/v1/tokens/${address}/report`)
                const response = await fetch(`http://api.rugcheck.xyz/v1/tokens/${address}/report`);
                const data = await response.json();                
                let responseMessage = `RugCheckAnalyzer
                                Address: ${data.mint}
                                Risks: ${JSON.stringify(data.risks, null ,4)}
                                Score: ${JSON.stringify(data.score)}
                                Rugged: ${data.rugged}\n`
                data.markets?.forEach(market => {
                    responseMessage+=`Market ${market.marketType}
                    LP: ${market.lp.lpLockedUSD}`    
                });    
                console.log(responseMessage);                        
                await rugcheckbot.sendMessage(msg.chat.id,  responseMessage);

            } catch(e) {
                console.log('Error: ', e)
            }
        }

    });
}

export async function stopListener(rugcheckbot: TelegramBot) {    
    await rugcheckbot.stopPolling({cancel: true, reason: 'stopped'})
    rugcheckbot.removeAllListeners('message');
    await rugcheckbot.close();
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




