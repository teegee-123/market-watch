import express from "express";
import { startListener, stopListener } from "./safe-bot-response-reader";
import { FileHandler } from "./file-handler";
require('dotenv').config()
const PORT = process.env.PORT;
const app = express();

const logFile = new FileHandler('./files/logs.json')
const postFile = new FileHandler('./files/posts.json')



app.listen(PORT, async () =>{
    // await stopListener();
    await startListener(logFile, postFile);
    console.log("Server is Successfully Running, and App is listening on port "+ PORT)
});

app.get('/ping', async (req, res) => {
    res.send(process.env.HELLO)
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

app.get('/purge', async(req, res) => {
    logFile.purgeFile();
    postFile.purgeFile();
    res.send("Files purged")
})