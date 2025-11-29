import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

import authRouter from "./routes/auth"
import workspaceRouter from "./routes/workspace"
import tasksRouter from "./routes/tasks"

import { authenticate } from "./middleware/auth"
import { requireRole } from "./middleware/role"
import { Role } from "./models/user.model"
dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI as string

const app = express()

app.use(express.json())
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"] // optional
  })
)

app.use("/api/v1/auth", authRouter)

// protected routes
app.use("/api/v1/workspaces", authenticate, workspaceRouter)
app.use("/api/v1/tasks", authenticate, tasksRouter)


// public
app.get("/test-1", (req, res) => {})
// admin only
app.get("/test-3", authenticate, requireRole([Role.ADMIN]), (req, res) => {})

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("DB connected")
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

app.listen(PORT, () => {
  console.log("Server is running")
})
