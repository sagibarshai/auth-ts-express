import express from "express"

import bodyParser from "body-parser"

import authRoute from "./routes/auth"
import cookieSession from "cookie-session"
import dotEnv from "dotenv"

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
  cookieSession({
    secure: false,
    signed: false,
  }),
)

dotEnv.config()

app.use("/api", authRoute)

app.listen(3300, () => console.log("server up (port 3300)"))
