// const express = require('express');
// require('dotenv').config()

import express, { Express, Request, Response } from "express";
// import dotenv from "dotenv";
require('dotenv').config()
const PORT = 3000;
const app = express();


app.listen(PORT, () =>
    console.log("Server is Successfully Running, and App is listening on port "+ PORT)
);

app.get('/ping', async (req, res) => {
    res.send("PING1!!!")
});


app.get('/view-market', async (req, res) => {
    res.send(process.env.HELLO)
});


app.get('/start-forwarder', async (req, res) => {
       
});

function runSensitiveCode(functionCall:  any) {
    const environment = process.env.ENVIRONMENT;
    if(environment === "LOCAL") {
        return "Cant run on local"
    }
    functionCall();
}

