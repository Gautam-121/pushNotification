import { Router } from "express";
import {sendNotification , updateServerKey , getServerKey } from "../controllers/firebase.controller.js"
import {getAllSegment , getProduct} from "../controllers/shopifyApi.cotroller.js"

const router = Router();

router.get("/api", (req, res) => {
  const sendData = { text: "This is coming from /apps/api route." };
  return res.status(200).json(sendData);
});


router.get("/api/shopify/segment", getAllSegment)

router.get("/api/firebase/server-key",getServerKey)

router.get("/api/shopify/products", getProduct)

router.post("/api/firebase/sendNotificatication", sendNotification)

router.put("/api/firebase/server-key",updateServerKey)


export default router;
