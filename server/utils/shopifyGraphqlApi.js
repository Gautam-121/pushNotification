import axios from "axios"

const shopifyApi = async (
  shopifyGraphQLEndpoint,
  graphqlQuery,
  axiosShopifyConfig,
  variables
) => {
    const shopifyResult = await axios.post(
      shopifyGraphQLEndpoint,
      { 
        query: graphqlQuery , 
        variables: variables 
      },
      axiosShopifyConfig,
    );
    return shopifyResult;
};

export default shopifyApi