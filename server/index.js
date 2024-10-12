const express = require("express");
const cors = require("cors");
require('dotenv').config()
const connectDB = require("./config/connectDB")
const router = require("./routes/index")
const cookiesParser = require("cookie-parser")
const { app,server } = require("./socket/index")
const path = require("path")

// const app = express();

const _dirname = path.resolve();

app.use(cors({
    origin : `${process.env.FRONTEND_URL}`,
    credentials : true
}))
app.use(express.json())
app.use(cookiesParser())



// app.get("/",(req,res)=>{
//     res.send("hello")
// })

//API EndPoints
app.use('/api',router)

app.use(express.static(path.join(_dirname,"/client/build")));

app.get('*',(req,res)=>{
    res.sendFile(path.resolve(_dirname,"client","build","index.html"));
})




connectDB().then(()=>{
    const start = server.listen(8080,()=>{
      const port = start.address().port
        console.log("Server running at http://localhost:"+port)
    })
})
