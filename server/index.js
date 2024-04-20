import "@shopify/shopify-api/adapters/node";
import "dotenv/config";
import express from "express";
import { resolve } from "path";
import shopify from "./utils/shopifyConfig.js";
import cors from "cors"
import { connectDB } from "./config/index.js"
import sessionHandler from "./utils/sessionHandler.js";
import csp from "./middleware/csp.middleware.js";
import setupCheck from "./utils/setupCheck.js";
import applyAuthMiddleware from "./middleware/auth.middleware.js";
import isShopActive from "./middleware/isShopActive.middleware.js";
import verifyProxy from "./middleware/verifyProxy.middleware.js";
import verifyRequest from "./middleware/verifyRequest.middleware.js";
import proxyRouter from "./routes/app_proxy/index.js";
import router from "./routes/index.js";
import webhookRegistrar from "./webhooks/index.js";

setupCheck(); // Run a check to ensure everything is setup properly

const PORT = parseInt(process.env.PORT, 10) || 8081;
const isDev = process.env.NODE_ENV === "dev";
 
// Register all webhook handlers
webhookRegistrar();

const app = express();
app.use(cors())

const createServer = async (root = process.cwd()) => {
  app.disable("x-powered-by");

  applyAuthMiddleware(app);

  // Incoming webhook requests
  app.post(
    "/webhooks/:topic",
    express.text({ type: "*/*" }),
    async (req, res) => {
      const { topic } = req.params || "";
      const shop = req.headers["x-shopify-shop-domain"] || "";

      try {
        await shopify.webhooks.process({
          rawBody: req.body,
          rawRequest: req,
          rawResponse: res,
        });
        console.log(`--> Processed ${topic} webhook for ${shop}`);
      } catch (e) {
        console.error(
          `---> Error while registering ${topic} webhook for ${shop}`,
          e
        );
        if (!res.headersSent) {
          res.status(500).send(error.message);
        }
      }
    }
  );

  app.use(express.json());

  app.post("/graphql", verifyRequest, async (req, res) => {
    try {
      const sessionId = await shopify.session.getCurrentId({
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
      });
      const session = await sessionHandler.loadSession(sessionId);
      const response = await shopify.clients.graphqlProxy({
        session,
        rawBody: req.body,
      });
      res.status(200).send(response.body);
    } catch (e) {
      console.error(`---> An error occured at GraphQL Proxy`, e);
      res.status(403).send(e);
    }
  });

  app.use(csp);
  app.use(isShopActive);
  // If you're making changes to any of the routes, please make sure to add them in `./client/vite.config.cjs` or it'll not work.
  app.use("/apps" , verifyRequest , router); //Verify user route requests
  app.use("/proxy_route", verifyProxy, proxyRouter); //MARK:- App Proxy routes

  if (!isDev) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");

    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${root}/dist/client/index.html`));
    });
  }

  return { app };
};

connectDB()
  .then(() => {
    createServer().then(({ app }) => {
      app.listen(PORT, () => {
        console.log(`--> Running on ${PORT}`);
      });
    });
  })
  .catch((error) => {
    console.log("DATABASE CONNECTION FAILED", error);
  });
