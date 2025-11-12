import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors(
    {origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import otpRoutes from "./routes/otp.routes.js";
app.use("/api/otp", otpRoutes);


import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users" ,userRouter)

import uplodRouter from "./routes/upload.routes.js"
app.use("/api/v1/uploads", uplodRouter);

import noteRouter from "./routes/note.routes.js";
app.use("/api/v1/notes", noteRouter);



export {app}