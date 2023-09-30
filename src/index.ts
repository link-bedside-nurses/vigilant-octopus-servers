import "reflect-metadata";
// import "module-alias/register";
import { replaceTscAliasPaths } from "tsc-alias";
import { rateLimit } from 'express-rate-limit'
replaceTscAliasPaths().then(() => logger.info("TSC Aliases Replaced!"));

import "dotenv/config";

import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express from "express";
import morgan from "morgan";
import { StatusCodes } from "http-status-codes";

import Logger from "@/utils/logger";
import { EnvironmentVars } from "@/constants";
import { disconnectFromDatabase, connectToDatabase } from "./database/connection";
import errorMiddleware from "@/middlewares/error-middleware";
import logger from "@/utils/logger";

// modules router
// import authRouter from "@/modules/authentication";

const app = express();

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (EnvironmentVars.getNodeEnv() === "development") {
  app.use(morgan("common", { immediate: true }));
}

const ONE_MINUTE = 60 * 1000
app.use(rateLimit({
  windowMs: ONE_MINUTE,
  max: EnvironmentVars.getNodeEnv() === "production"  ? 10 : Number.MAX_SAFE_INTEGER,
}))

app.use(`/status`, function (request: express.Request, response: express.Response) {
  return response.status(StatusCodes.OK).send({ message: "Server is online!", requestHeaders: request.headers });
});

app.use(errorMiddleware);

process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection at:", { promise: promise, reason: reason });
});
process.on("uncaughtException", (exception) => {
  Logger.error("Uncaught Exception", exception);
});

const server = app.listen(EnvironmentVars.getPort(), () => {
  Logger.info("Server now online on port: " + EnvironmentVars.getPort());

  connectToDatabase().then(() => logger.debug("Connected to DB"));
});

const shutdownSignals = ["SIGTERM", "SIGINT"];
function gracefulShutdown(signal: string) {
  process.on(signal, async () => {
    await disconnectFromDatabase();

    server.close((error) => {
      Logger.error(error, "Failed to close server. Server was not open!");
    });

    process.exit(0);
  });
}
for (let counter = 0; counter < shutdownSignals.length; counter++) {
  gracefulShutdown(shutdownSignals[counter]);
}
