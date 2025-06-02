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

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($userId: ID!, $productId: ID!) {
    createNotification(userId: $userId, productId: $productId) {
      id
      user {
        id
        phone
        email
      }
      product {
        id
        name
        brand {
          name
        }
      }
      active
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`; 