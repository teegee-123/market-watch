import express from "express";
import { startListener, stopListener } from "./safe-bot-response-reader";
import { FileHandler } from "./file-handler";
import TelegramBot from "node-telegram-bot-api";
require('dotenv').config()
const PORT = process.env.PORT;
const token = process.env.SAFEBOTREADERTOKEN
const app = express();
const logFile = new FileHandler('./files/logs.json')
const postFile = new FileHandler('./files/posts.json')
const errorFile = new FileHandler('./files/errors.json')
const safeReaderBot = new TelegramBot(token);


app.listen(PORT, async () =>{
    // await stopListener();
    await safeReaderBot.sendMessage(process.env.BUYSIGNALSCHATID, "Test 213");
    console.log("SENT TEST")
    await startListener(logFile, postFile, errorFile, safeReaderBot);
    console.log("Server is Successfully Running, and App is listening on port "+ PORT)
});

app.get('/ping', async (req, res) => {
    res.send(process.env.HELLO)
});


app.get('/start', async (req, res) => {
    await startListener(logFile, postFile, errorFile, safeReaderBot);
    res.send("started listening")
});



app.get('/view-market', async (req, res) => {
    res.send(process.env.HELLO)
});


app.get('/stop', async (req, res) => {
    await stopListener(safeReaderBot);
    res.send("Stopped listening")
});

app.get('/logs', async(req, res) => {
    res.send(logFile.readFile())
})

app.get('/posts', async(req, res) => {
    res.send(postFile.readFile())
})

app.get('/errors', async(req, res) => {
    res.send(errorFile.readFile())
})

app.get('/purge', async(req, res) => {
    logFile.purgeFile();
    postFile.purgeFile();
    res.send("Files purged")
})