const express = require("express");
const app = express();

const port = 8080;

app.get("/",(req,res)=>{
    res.send("hi this is root page")
})

app.listen(port , (req,res)=>{
    
    console.log("app is start listing on port 8080");
})