import dotenv from "dotenv";
dotenv.config();
import asyncHandler from "../utils/asyncHandler.js";
import { 
  shopifyGraphQLEndpoint , 
  axiosShopifyConfig,
  graphqlQueryForSegments,
  graphqlQueryForProducts
} from "../constant.js"
import Store from "../models/stores.model.js";
import ApiError from "../utils/ApiError.js";
import shopifyApi from "../utils/shopifyGraphqlApi.js"
import ApiResponse from "../utils/ApiResponse.js";


export const getAllSegment = asyncHandler( async (req, res , next) => {

  const store = await Store.findByPk(req?.shopId)

  if(!store || !store.isActive){
    return next(
      new ApiError(
        `Store not found with id: ${req.shop_id}`,
         404
      )
    )
  }
    // const shop = req.query.shop;
    
    // const [ , sessionDetail] = await Session.findAll({where : {shop : shop}})
     
    // if (sessionDetail === null) {
    //   return undefined;
    // }
    // if (sessionDetail.content.length == 0) {
    //   return undefined;
    // }

    // const { accessToken } = JSON.parse(cryption.decrypt(sessionDetail.content));

    // const shopifyGraphQLEndpoint = `https://${sessionDetail.shop}/admin/api/2023-04/graphql.json`;

    // const graphqlQuery = `
    //   {
    //     segments(first: 100) {
    //       edges {
    //         node {
    //           creationDate
    //           id
    //           lastEditDate
    //           name
    //           query
    //         }
    //       }
    //     }
    //   }
    // `;

    // const axiosShopifyConfig = {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-Shopify-Access-Token": accessToken,
    //   },
    // };

    // const fetchSegment = await axios.post(
    //   shopifyGraphQLEndpoint,
    //   { query: graphqlQuery },
    //   axiosShopifyConfig
    // );

  const per_page = req.query?.per_page ?  parseInt(req.query.per_page) : 8
  const next_page = req.query.next_page || null

    const fetchSegment = await shopifyApi(
      shopifyGraphQLEndpoint(req.session?.shop),
      graphqlQueryForSegments,
      axiosShopifyConfig(req.session?.accessToken),
      {first: per_page , after: next_page}
    );

    if(fetchSegment?.data?.errors?.length > 0){
      const error = new ApiError("Something went wrong while fetching graphql query" , 500)
      return next(error)
     }

     const segments = fetchSegment?.data?.data?.segments;
     const hasNextPage = segments.pageInfo.hasNextPage;
     const nextCursor = hasNextPage ? segments.pageInfo.endCursor : null;
     const segmentItems = segments.edges.map((edge) => edge.node);

    // const segments = fetchSegment?.data?.data?.segments?.edges?.map((edge) => edge.node);
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          hasNextPage,
          nextCursor,
          segments:segmentItems,
        },
        "Data send successfully"
      )
    )

    // return res.status(200).json({
    //   success: true,
    //   segments
    // });
})

export const getProduct = asyncHandler( async (req, res) => {

  const store = await Store.findByPk(req?.shopId)

  if(!store || !store.isActive){
    return next(
      new ApiError(
        `Store not found with id: ${req.shop_id}`,
         404
      )
    )
  }

  const per_page = req.query?.per_page ?  parseInt(req.query.per_page) : 8
  const next_page = req.query.next_page || null

  const fetchProducts = await shopifyApi(
    shopifyGraphQLEndpoint(req?.shop),
    graphqlQueryForProducts,
    axiosShopifyConfig(req.accessToken),
    {first: per_page , after: next_page}
  );

 if(fetchProducts?.data?.errors?.length > 0){
  const error = new ApiError("Something went wrong while fetching graphql query" , 500)
  return next(error)
 }

const product = fetchProducts?.data?.data?.products;
const hasNextPage = product.pageInfo.hasNextPage;
const nextCursor = hasNextPage ? product.pageInfo.endCursor : null;
const items = product.edges.map((edge) => edge.node);

return res.status(200).json(
  new ApiResponse(
    200,
    {
      hasNextPage,
      nextCursor,
      products:items
    },
    "Product Send successfully"
  )
)
})

