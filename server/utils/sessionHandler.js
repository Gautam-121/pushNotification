import { Session } from "@shopify/shopify-api";
import Cryptr from "cryptr";
import Sessions from "../models/sessions.model.js";

const cryption = new Cryptr(process.env.ENCRYPTION_STRING);

const storeSession = async (session , shopId) => {

  const storeSession = await Sessions.findByPk(session?.id)

  if(storeSession){
    await Sessions.update(
      {
        token: cryption.encrypt(JSON.stringify(session)),
        shopId: shopId,
        isOnline: session.isOnline
      },
      {
        where:{
          id: session.id
        }
      }
    )
  }
  else{
    await Sessions.create({
        id: session.id,
        token: cryption.encrypt(JSON.stringify(session)),
        shopId: shopId,
        isOnline: session.isOnline
    })
  }

  return true;
};

const loadSession = async (id) => {

  const sessionResult = await Sessions.findByPk(id)

  if (sessionResult === null) {
    return undefined;
  }
  if (sessionResult.token.length > 0) {
    const sessionObj = JSON.parse(cryption.decrypt(sessionResult.token));
    const returnSession = new Session(sessionObj);
    return returnSession;
  }
  return undefined;
};

const deleteSession = async (id) => {
  await Sessions.destroy({where : {id : id}})
  return true;
};

const sessionHandler = { storeSession, loadSession, deleteSession };

export default sessionHandler;
