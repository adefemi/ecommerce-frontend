import { gql } from "@apollo/client";

export const LoginMutation = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      access
      refresh
      user {
        id
        firstName
        lastName
        userBusiness {
          name
          id
        }
        userWish {
          products {
            id
          }
        }
        userCarts {
          id
          quantity
          product {
            id
            totalCount
          }
        }
      }
    }
  }
`;

export const RegisterMutation = gql`
  mutation RegisterMutation(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
  ) {
    registerUser(
      email: $email
      firstName: $firstName
      lastName: $lastName
      password: $password
    ) {
      message
    }
  }
`;

export const meQuery = gql`
  query meQuery {
    me {
      id
      firstName
      lastName
      userBusiness {
        name
        id
      }
      userWish {
        products {
          id
        }
      }
      userCarts {
        id
        quantity
        product {
          id
          totalCount
        }
      }
    }
  }
`;

export const getAccessMutation = gql`
  mutation getAccessMutation($refresh: String!) {
    getAccess(refresh: $refresh) {
      access
    }
  }
`;

export const createBusinessMutation = gql`
  mutation createBusinessMutation($name: String!) {
    createBusiness(name: $name) {
      business {
        id
      }
    }
  }
`;

export const uploadImageMutation = gql`
  mutation uploadImageMutation($image: Upload!) {
    imageUpload(image: $image) {
      image {
        id
        image
      }
    }
  }
`;

export const categoryQuery = gql`
  query categoryQuery($name: String) {
    categories(name: $name) {
      id
      name
      count
    }
  }
`;

export const createProductMutation = gql`
  mutation createProductMutation(
    $images: [ProductImageInput]
    $productData: ProductInput!
    $totalCount: Int!
  ) {
    createProduct(
      images: $images
      productData: $productData
      totalCount: $totalCount
    ) {
      product {
        id
      }
    }
  }
`;

export const productQuery = gql`
  query productQuery(
    $search: String
    $minPrice: Float
    $maxPrice: Float
    $category: String
    $business: String
    $sortBy: String
    $isAsc: Boolean
    $mine: Boolean
  ) {
    products(
      search: $search
      minPrice: $minPrice
      maxPrice: $maxPrice
      category: $category
      business: $business
      sortBy: $sortBy
      isAsc: $isAsc
      mine: $mine
    ) {
      total
      size
      current
      hasNext
      hasPrev
      results {
        id
        name
        price
        createdAt
        totalAvailable
        productImages {
          isCover
          image {
            image
          }
        }
      }
    }
  }
`;

export const singleProductQuery = gql`
  query singleProductQuery($id: ID!) {
    product(id: $id) {
      category {
        name
      }
      business {
        name
      }
      name
      price
      totalAvailable
      description
      productImages {
        image {
          image
        }
        isCover
      }
      productComments {
        comment
        createdAt
      }
    }
  }
`;

export const toggleWish = gql`
  mutation toggleWish($productId: ID!) {
    handleWishList(productId: $productId) {
      status
    }
  }
`;

export const createCartMutation = gql`
  mutation createCartMutation($productId: ID!, $quantity: Int) {
    createCartItem(productId: $productId, quantity: $quantity) {
      cartItem {
        quantity
        id
        product {
          id
          totalCount
        }
      }
    }
  }
`;

export const updateCartMutation = gql`
  mutation updateCartMutation($cartId: ID!, $quantity: Int!) {
    updateCartItem(cartId: $cartId, quantity: $quantity) {
      cartItem {
        id
        quantity
        product {
          id
          totalCount
        }
      }
    }
  }
`;

export const deleteCartMutation = gql`
  mutation deleteCartMutation($cartId: ID!) {
    deleteCartItem(cartId: $cartId) {
      status
    }
  }
`;

export const cartQuery = gql`
  query cartQuery($name: String) {
    carts(name: $name) {
      quantity
      id
      product {
        name
        price
        totalAvailable
        productImages {
          isCover
          image {
            image
          }
        }
      }
    }
  }
`;

export const completePaymentMutation = gql`
  mutation completePaymentMutation {
    completePayment {
      status
    }
  }
`;

export const deleteProductMutation = gql`
  mutation deleteProductMutation($productId: ID!) {
    deleteProduct(productId: $productId) {
      status
    }
  }
`;

export const requestCartQuery = gql`
  query requestCartQuery($name: String) {
    requestCarts(name: $name) {
      quantity
      product {
        name
        price
        productImages {
          isCover
          image {
            image
          }
        }
      }
      user {
        firstName
        lastName
      }
    }
  }
`;
