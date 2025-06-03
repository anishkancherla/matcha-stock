import { gql } from '@apollo/client';

export const REGISTER_USER = gql`
  mutation RegisterUser($phone: String, $email: String) {
    registerUser(phone: $phone, email: $email) {
      id
      phone
      email
    }
  }
`;

export const CREATE_BRAND_NOTIFICATION = gql`
  mutation CreateBrandNotification($userId: ID!, $brandId: ID!) {
    createBrandNotification(userId: $userId, brandId: $brandId) {
      id
      user {
        id
        email
      }
      brand {
        id
        name
      }
      active
    }
  }
`;

export const DELETE_BRAND_NOTIFICATION = gql`
  mutation DeleteBrandNotification($id: ID!) {
    deleteBrandNotification(id: $id)
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($userId: ID!, $productId: ID!) {
    createNotification(userId: $userId, productId: $productId) {
      id
      userId
      productId
      active
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`; 