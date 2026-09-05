import express from 'express'
import dotenv from "dotenv"
dotenv.config()
import { connectDb } from './configs/db.js'
import roadmapRouter from './routes/roadmap.route.js'

const app = express()
app.use(express.json());

const PORT = process.env.PORT || 6004



app.use("/",roadmapRouter)

const startServer = async () => {
      try {
            await connectDb()
            app.listen(PORT, () => {
                  console.log(`Roadmap Service Started on ${PORT}`)
            })
      } catch (error) {
            console.error("Roadmap service could not start:", error.message)
            process.exit(1)
      }
}

startServer()

