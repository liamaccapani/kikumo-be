// ******************** PACKAGES ********************
import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
// ******************** ROUTERS ********************
import clientsRouter from "../src/services/users/clients/clientRoutes.js"
import therapistsRouter from "../src/services/users/therapists/therapistRoutes.js"
import usersRouter from "../src/services/users/userRoutes.js"
// ******************** ERROR HANDLERS ********************
import { badRequest, forbidden, notFound, serverError, unauthorized } from "./errorHandlers.js"

const server = express()
const port = process.env.PORT || 3001

// ******************** CORS ********************
const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL]
const corsOpts = {
    origin: function (origin, next) {
        console.log("CURRENT ORIGIN: ", origin)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            // if received origin is in the whitelist we are going to allow that request
            next(null, true)
        } else {
            // if it is not, we are going to reject that request
            next(new Error(`Origin ${origin} not allowed!`))
        }
    },
}

// ******************** MIDDLEWARES ********************
server.use(cors(corsOpts))
server.use(express.json())


// ******************** ROUTES ********************
server.use("/users", usersRouter)
server.use("/clients", clientsRouter)
server.use("/therapists", therapistsRouter)


// ******************** ERROR HANDLERS ********************
server.use(badRequest)
server.use(unauthorized)
server.use(forbidden)
server.use(notFound)
server.use(serverError)

console.table(listEndpoints(server))

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("🚀 Mongo connected!")
  server.listen(port, () => {
    console.log(`🎈 Server running on port ${port}`)
  })
})