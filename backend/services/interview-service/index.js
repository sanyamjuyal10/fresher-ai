import express from 'express'
import dotenv from "dotenv"
dotenv.config()
import { connectDb } from './configs/db.js'

import interviewRouter from './routes/interview.route.js'
const app = express()
app.use(express.json());



const PORT = process.env.PORT || 6002

app.get("/", (req,res)=>{
    return res.send(`hello from interview-server `)


})
app.use("/",interviewRouter)




app.listen(PORT,()=>{
    console.log(`Interview Service Started on ${PORT}`)
    connectDb()
   
})

