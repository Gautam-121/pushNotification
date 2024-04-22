import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
import Cryptr from "cryptr";
import Session from "../models/sessions.model.js";
import readJsonlFile from "../utils/retiveJsonFile.js"
import downloadJsonlFile from "../utils/downLoadJsonFile.js";
import Store from "../models/stores.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { 
  shopifyGraphQLEndpoint ,
  customerSegmentBulkQuery,
  operationQuery
} from "../constant.js"

const cryption = new Cryptr(process.env.ENCRYPTION_STRING);

export const getServerKey = asyncHandler( async (req, res) => {

  const store = await Store.findByPk(req?.shopId)

  if(!store || !store.serverKey){
    return next(
      new ApiError(
        "Server key not found",
        404  
      )
    )
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      store.serverKey,
      "Data send successfull"
    )
  )
})

export const updateServerKey = asyncHandler(async (req, res) => {

  const { serverKey } = req?.body

  if (!serverKey) {
    return next(
      new ApiError(
        "Server key missing",
        400
      )
    )
  }

  let store = await Store.findByPk(req?.shopId)

  if(!store){
    return next(
      new ApiError(
        "Store not found",
        404
      )
    )
  }

  storeData = await Store.update(
    {
      serverKey: serverKey
    },
    {
      where: { 
        shopId : req?.shopId 
      }
    }
  )

  if (!store) {
    return next(
      new ApiError(
        "Something went wrong while updating server key",
         500
      )
    )
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Server key update successfully"
    )
  )
})

export const sendNotification = async (req, res) => {

  try {

    // const shop = req.query?.shop;

    // console.log("Enter")

    // if (!shop) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No Shop Provided"
    //   })
    // }

    const store = await Store.findByPk(req?.shopId)

    if(!store || !store.serverKey ){
      return next(
        new ApiError(
          "Server key not found",
          404
        )
      )
    }

    // const [, sessionDetail] = await Session.findAll({ where: { shop: shop } })

    // if (sessionDetail === null) {
    //   return undefined;
    // }
    // if (sessionDetail.content.length == 0) {
    //   return undefined;
    // }

    console.log("Enter upto 104")

    // const { accessToken } = JSON.parse(cryption.decrypt(sessionDetail.content));

    // const shopifyGraphQLEndpoint = `https://${shop}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

    const { title, body, segments: { name, id }, click_action } = req.body?.notificationMessage;

    if (!title || !body || !name || !id) {
      return next(
        new ApiError(
          "Please Provide title , message and selected Segment",
          400
        )
      )
    }

    // Set up the Axios request config for shopify
    // const axiosShopifyConfig = {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-Shopify-Access-Token": accessToken, // remove static value add because we haven't access of user
    //   },
    // };

    // Set up the Axios request config for firebase
    const axiosFirebaseConfig = {
      headers: {
        Authorization: `key=${store.serverKey}`,
        "Content-Type": "application/json",
      },
    };

    // console.log("ServerKey" , sessionDetail.serverKey , "Server key end")

    console.log("Enter upto 135")


    const topicName = name.replace(/\W+/g, '_'); // Replace non-alphanumeric characters with underscores

//     const customerSegmentBulkQuery = `
//    mutation {
//    bulkOperationRunQuery(
//    query: """
//    {
//     customerSegmentMembers(
//         first: 100
//         segmentId: "${id}"
//     ) {
//         edges {
//             node {
//             firstName
//             metafield(key: "custom.firebase_token") {
//               key
//               value
//             }

//             }
//         }
//     }
//    }
//     """
//   ) {
//     bulkOperation {
//       id
//       status
//     }
//     userErrors {
//       field
//       message
//     }
//   }
// }`

    console.log("Enter upto 174")

    const customersBulkIdResponse = await shopifyApi(
      shopifyGraphQLEndpoint(req.session?.shop),
      customerSegmentBulkQuery(id),
      axiosShopifyConfig(req.session?.accessToken),
    );


    // const customersBulkIdResponse = await axios.post(shopifyGraphQLEndpoint(req.session?.shop), { query: customerSegmentBulkQuery }, axiosShopifyConfig);

    const operationId = (customersBulkIdResponse?.data?.data?.bulkOperationRunQuery?.bulkOperation?.id) + ""

    // Define a function to check the status of the bulk operation
    const checkOperationStatus = async (operationId) => {
      const statusQuery = `
    {
      node(id: "${operationId}") {
        ... on BulkOperation {
          status
        }
      }
    }
  `;

  console.log("Enter upto 192")

      const statusResponse = await axios.post(
        shopifyGraphQLEndpoint,
        { query: statusQuery },
        axiosShopifyConfig
      );

      return statusResponse.data.data.node.status;
    };

    // Check the status of the bulk operation in a loop
    let operationStatus = await checkOperationStatus(operationId);

    while (operationStatus === 'RUNNING') {
      // Add a delay before checking the status again
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check the status again
      operationStatus = await checkOperationStatus(operationId);
    }

//     // Continue to retrieve the URL
//     const operationQuery = `{
//     node(id: "${operationId}") {
//     ... on BulkOperation {
//       url
//       partialDataUrl
//       errorCode
//       status
//     }
//   }
// }
// `;
console.log("Enter upto 227")

const operationResponse = await shopifyApi(
  shopifyGraphQLEndpoint(req.session?.shop),
  operationQuery(operationId),
  axiosShopifyConfig(req.session?.accessToken)
);

    //Execute the GraphQL query for operation details
    // const operationResponse = await axios.post(
    //   shopifyGraphQLEndpoint,
    //   { query: operationQuery },
    //   axiosShopifyConfig
    // );

    const operationUrl = operationResponse?.data?.data?.node?.url;

    //Destination of dowloadJsonFile
    const destination = 'bulk-data.jsonl';

    await downloadJsonlFile(operationUrl, destination)

    //Read FirebaseTokens from dowloadedJson File
    let firebaseTokens = await readJsonlFile(destination)

    firebaseTokens = ["dLPRXoI3nkyeq8s0LiEGjA:APA91bFvWdu3yBpKMRAr1BDacTvF9P9Bk6zjHVqvLLhyOi_KkFmwAyeEkus4w20dkXdY68bEPric-37etPPOBniQeX4UOSCiWRlQE-MZfEPmCWmn4nh8TCg00tbtS6ovflbmg_UW4HJT"] // remove this line as well when you get firebaseToken attached with server key

    const subscribeTopic = await axios.post(
      "https://iid.googleapis.com/iid/v1:batchAdd",
      {
        to: `/topics/${topicName}`,
        registration_tokens: firebaseTokens,
      },
      axiosFirebaseConfig
    );

    console.log("Enter upto 256")


    if (subscribeTopic?.data?.results?.error) {
      return res.status(401).json({
        success: false,
        message: `${createTopic?.data?.results?.error} fireabseToken are not linked to your serverKey `
      })
    }

    const sendMessage = {
      notification: {
        body: body,
        title: title,
      },
      to: `/topics/${topicName}`,
    };

    if (click_action) {
      sendMessage.notification["click_action"] = click_action
    }

    console.log("click action", sendMessage.notification["click_action"])

    //axios request for sendingPushNotification
    const sendNotification = await axios.post(
      "https://fcm.googleapis.com/fcm/send",
      sendMessage,
      axiosFirebaseConfig
    );

    //Handle Error Edge case if serverKey is Invalid or message Not Send
    if (sendNotification?.data?.failure === 1) {
      return res.status(400).json({
        success: false,
        message: "Notification Not Send"
      })
    }

    await axios.post(
      "https://iid.googleapis.com/iid/v1:batchRemove",
      {
        to: `/topics/${topicName}`,
        registration_tokens: firebaseTokens,
      },
      axiosFirebaseConfig
    );

    return res.status(200).json({
      success: true,
      message: "Notification Send Successfylly",
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false, message: error.message, statusCode: error.response?.status,
      data: error.response?.data
    });
  };
}




