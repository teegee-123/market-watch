import express from "express";
import dotenv from "dotenv";
import { startListener, stopListener } from "./safe-bot-response-reader";
dotenv.config();
const PORT = process.env.PORT;
const app = express();


app.listen(PORT, async () =>{
    // await stopListener();
    // await startListener();
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


function runSensitiveCode(functionCall:  any) {
    const environment = process.env.ENVIRONMENT;
    if(environment === "LOCAL") {
        return "Cant run on local"
    }
    functionCall();
}

