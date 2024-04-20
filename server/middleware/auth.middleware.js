import {
  BotActivityDetected,
  CookieNotFound,
  InvalidOAuthError,
  InvalidSession,
} from "@shopify/shopify-api";
import authRedirect from "../utils/authRedirect.js";
import Store from "../models/stores.model.js";
import sessionHandler from "../utils/sessionHandler.js";
import shopify from "../utils/shopifyConfig.js";
import { TEST_QUERY } from "../constant.js"

const authMiddleware = (app) => {
  
  app.get("/auth", async (req, res) => {
    try {
      await authRedirect(req, res);
    } catch (e) {
      console.error(`---> Error at /auth`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof CookieNotFound:
          return res.redirect(`/exitframe/${shop}`);
          break;
        case e instanceof InvalidOAuthError:
        case e instanceof InvalidSession:
          res.redirect(`/auth?shop=${shop}`);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });

  app.get("/auth/tokens", async (req, res) => {

    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callbackResponse;
      const client = new shopify.clients.Graphql({ session });
      const response = await client.request(TEST_QUERY);

      await sessionHandler.storeSession(session , response?.data?.shop?.id);

      const webhookRegisterResponse = await shopify.webhooks.register({
        session,
      }); //Register all webhooks with offline token

      console.dir(webhookRegisterResponse, { depth: null }); //This is an array that includes all registry responses.

      return await shopify.auth.begin({
        shop: session.shop,
        callbackPath: "/auth/callback",
        isOnline: true,
        rawRequest: req,
        rawResponse: res,
      });

    } catch (e) {
      console.error(`---> Error at /auth/tokens`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof CookieNotFound:
          return res.redirect(`/exitframe/${shop}`);
          break;
        case e instanceof InvalidOAuthError:
        case e instanceof InvalidSession:
          res.redirect(`/auth?shop=${shop}`);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });

  app.get("/auth/callback", async (req, res) => {

    try {
      const callbackResponse = await shopify.auth.callback({
        rawRequest: req,
        rawResponse: res,
      });

      const { session } = callbackResponse;
      const client = new shopify.clients.Graphql({ session });
      const response = await client.request(TEST_QUERY);

      await sessionHandler.storeSession(session , response?.data?.shop?.id);

      const host = req.query.host;
      const { shop } = session;

      const store = await Store.findByPk(response?.data?.shop?.id)

      if(store){
        await Store.update(
          {
            shopName : shop,
            shopifyShopDomain:session?.shop,
            owner: session?.onlineAccessInfo?.associated_user?.first_name + " " + session?.onlineAccessInfo?.associated_user?.last_name,
            email: session?.onlineAccessInfo?.associated_user?.email,
            isActive: true
          },
          {
            where:{
              shopId: response?.data?.shop?.id
            }
          }
        )
      }
      else{
        await Store.create({
          shopId : response?.data?.shop?.id,
          shopName : shop,
          shopifyShopDomain:session?.shop,
          owner: session?.onlineAccessInfo?.associated_user?.first_name + " " + session?.onlineAccessInfo?.associated_user?.last_name,
          email: session?.onlineAccessInfo?.associated_user?.email,
          isActive: true
        })
      }

      console.log("session is " , session)

      // Redirect to app with shop parameter upon auth
      res.redirect(`/?shop=${shop}&host=${host}`);

    } catch (e) {
      console.error(`---> Error at /auth/callback`, e);
      const { shop } = req.query;
      switch (true) {
        case e instanceof CookieNotFound:
        case e instanceof InvalidOAuthError:
        case e instanceof InvalidSession:
          res.redirect(`/auth?shop=${shop}`);
          break;
        case e instanceof BotActivityDetected:
          res.status(410).send(e.message);
          break;
        default:
          res.status(500).send(e.message);
          break;
      }
    }
  });
};

export default authMiddleware;
