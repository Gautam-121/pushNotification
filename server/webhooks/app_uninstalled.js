import Session from "../models/sessions.model.js";
import Store from "../models/stores.model.js";

/**
 * @typedef { import("../../_developer/types/2023-07/webhooks.js").APP_UNINSTALLED } webhookTopic
 */

const appUninstallHandler = async (
  topic,
  shop,
  webhookRequestBody,
  webhookId,
  apiVersion
) => {
  /** @type {webhookTopic} */
  const webhookBody = JSON.parse(webhookRequestBody);

  await Store.update(
    {
      isActive : false
    },
    {
      where: {
        shopId: `gid://shopify/Shop/${webhookBody.id}`,
      },
      limit: 1
    }
  )

  await Session.destroy({
    where:{
      shopId:`gid://shopify/Shop/${webhookBody.id}`
    }
  })
};

export default appUninstallHandler;
