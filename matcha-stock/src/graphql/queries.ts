import { gql } from '@apollo/client';

export const GET_ALL_BRANDS = gql`
  query GetAllBrands {
    brands {
      id
      name
      website
    }
  }
`;

export const CHECK_BRAND_NOTIFICATION = gql`
  query CheckBrandNotification($email: String!, $brandId: ID!) {
    userByEmail(email: $email) {
      id
      brandNotifications {
        id
        brandId
        active
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    products {
      id
      name
      weight
      price
      imageUrl
      url
      inStock
      lastChecked
      brand {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCTS_BY_BRAND = gql`
  query GetProductsByBrand($brandId: ID!) {
    products(brandId: $brandId) {
      id
      name
      weight
      price
      imageUrl
      url
      inStock
      lastChecked
      brand {
        id
        name
      }
    }
  }
`;

export const GET_IN_STOCK_PRODUCTS = gql`
  query GetInStockProducts {
    inStockProducts {
      id
      name
      weight
      price
      imageUrl
      url
      inStock
      lastChecked
      brand {
        id
        name
      }
    }
  }
`;

export const GET_OUT_OF_STOCK_PRODUCTS = gql`
  query GetOutOfStockProducts {
    outOfStockProducts {
      id
      name
      weight
      price
      imageUrl
      url
      inStock
      lastChecked
      brand {
        id
        name
      }
    }
  }
`; 