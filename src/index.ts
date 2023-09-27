import "reflect-metadata";
// import "module-alias/register";
import { replaceTscAliasPaths } from "tsc-alias";
replaceTscAliasPaths();

import "dotenv/config";

import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express from "express";
// import { Server } from "socket.io";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";

import Logger from "@/utils/logger";
import { EnvironmentVars } from "@/constants";
import { disconnectFromDatabase, connectToDatabase } from "./database/connection";
import errorMiddleware from "@/middlewares/error-middleware";

// modules routers
// import authRouter from "@/modules/authentication";

const app = express();

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use morgan middleware only in development
if (EnvironmentVars.getNodeEnv() === "development") {
  app.use(morgan("common", { immediate: true }));
}

// Rate limiting middleware

// modules router handler middlewares

app.use(`/status`, function (request: express.Request, response: express.Response) {
  return response.status(StatusCodes.OK).send({ message: "Server is online!", requestHeaders: request.headers });
});

// Error middleware
app.use(errorMiddleware);

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", { promise: promise, reason: reason });
});
process.on("uncaughtException", (exception) => {
  Logger.error("Uncaught Exception", exception);
});

const server = app.listen(3000, () => {
  Logger.info("Server now online");

  // connect to database
  connectToDatabase();
});

// const io = new Server(server);

// Gracefully shutdown server and database
const shutdownSignals = ["SIGTERM", "SIGINT"];
function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    // close database connection
    disconnectFromDatabase();

    server.close((error) => {
      Logger.error(error, "Server wasnot open!");
    });

    // release resources if any or need be.

    process.exit(0);
  });
}
for (let counter = 0; counter < shutdownSignals.length; counter++) {
  gracefulShutdown(shutdownSignals[counter]);
}
