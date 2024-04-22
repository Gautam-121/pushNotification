export const TEST_QUERY = `
{
  shop {
    name
    id
  }
}`;
export const graphqlQueryForSegments = `
query Segments($first: Int!, $after: String) {
  segments(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        name
        query
        creationDate
        lastEditDate
      }
    }
  }
}
`;
export const graphqlQueryForProducts = `
query Products($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      cursor
      node {
        id
        title
      }
    }
  }
}
`;
export const graphqlQueryForCollections = `
query MyQuery($first: Int!, $after: String) {
  collections(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      description
      id
      image {
        url
      }
      title
      handle
    }
  }
}`;
export const graphqlQueryForProductsByCollectionId =  `
query GetProductsByCollectionId($collectionId: ID!, $first: Int!, $after: String) {
  collection(id: $collectionId) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          featuredImage {
            url
          }
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          totalInventory
          productType
          isGiftCard
  
        }
      }
    }
  }
}
`;
export const customerSegmentBulkQuery = (id) => `
   mutation {
   bulkOperationRunQuery(
   query: """
   {
    customerSegmentMembers(
        first: 100
        segmentId: "${id}"
    ) {
        edges {
            node {
            firstName
            metafield(key: "custom.firebase_token") {
              key
              value
            }

            }
        }
    }
   }
    """
  ) {
    bulkOperation {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}`;
export const operationQuery = (operationId)=>`{
  node(id: "${operationId}") {
  ... on BulkOperation {
    url
    partialDataUrl
    errorCode
    status
  }
}
}
`
export const shopifyGraphQLEndpoint = (shop) =>  `https://${shop || "renergii.myshopify.com"}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;

export const axiosShopifyConfig = function(accessToken) {
  return {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken || "shpua_177ec0655453453b3619532c8a216b04",
      },
    };
}