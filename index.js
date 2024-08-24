const express = require('express');
const app = express();
const PORT = 3000;
require('dotenv').config()

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

app.get('/view-market', async (req, res) => {
    res.send(process.env.HELLO+ " "+process.env.ENVIRONMENT)
});


app.get('/watch', async (req, res) => {
    
});

