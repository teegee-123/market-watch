import { request } from "http";
import TelegramBot, { TelegramEvents } from "node-telegram-bot-api";
import { Request } from "request";


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
    await rugcheckbot.sendMessage(process.env.BUYSIGNALSCHATID,  `Started rugcheck bot service ${new Date()} ON ${environment}`);

    rugcheckbot.on('message', async (msg, meta) => {
        const addresses = msg.text?.match("[A-Za-z0-9]{44}") 
        if(addresses.length){
            const address = addresses[0]
            try{
                request(`https://api.rugcheck.xyz/v1/tokens/${address}/report`, async (response) => {
                    if (response.statusCode === 200) {
                        console.log(response) 
                        await rugcheckbot.sendMessage(msg.chat.id, JSON.stringify(response, null ,4 ))
                     }
                     else console.log('Error ', response)
                })
            } catch(e) {
                console.log('Error: ', e)
            }
        }
        // if(msg.text?.includes('SafeAnalyzer')) {            
        //     try{

        //         // const strat = new SafeAnalyzerStrategy(mapToSafeScanner(msg));                
        //         // // await safeReaderBot.sendMessage("-100"+msg.from.id, JSON.stringify(strat.data.conditions))
        //         // logFile.writeFile(strat as never);
        //         // console.log(strat.data)
        //         // console.log(strat.conditionsMet())
        //         // console.log("strat.data.safety", strat.data.safety)
        //         // console.log(environment)
        //         // if(strat.conditionsMet() && environment !== "LOCAL") {
        //         //     await rugcheckbot.sendMessage(process.env.BUYSIGNALSCHATID, "New signal: " +strat.data.contractAddress + " from feed "+ strat.data.fromFeed+"\n\n"+ JSON.stringify(strat.data, null, 4));
        //         //     postFile.writeFile(strat as never);
        //         // }

        //     } catch(e) {
        //         console.log(e)
        //     }
        // }
    });
}

export async function stopListener(safeReaderBot: TelegramBot) {    
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




