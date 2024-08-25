import express from "express";
import { startListener, stopListener } from "./safe-bot-response-reader";
import { FileHandler } from "./file-handler";
require('dotenv').config()
const PORT = process.env.PORT;
const app = express();

const logFile = new FileHandler('./files/logs.json')
const postFile = new FileHandler('./files/posts.json')
const errorFile = new FileHandler('./files/errors.json')



app.listen(PORT, async () =>{
    // await stopListener();
    await startListener(logFile, postFile, errorFile);
    console.log("Server is Successfully Running, and App is listening on port "+ PORT)
});

app.get('/ping', async (req, res) => {
    res.send(process.env.HELLO)
});


app.get('/start', async (req, res) => {
    await startListener(logFile, postFile, errorFile);
    res.send("started listening")
});



app.get('/view-market', async (req, res) => {
    res.send(process.env.HELLO)
});


app.get('/stop', async (req, res) => {
    await stopListener();
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