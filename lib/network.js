import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import cookie from "js-cookie";
import {
  expiredToken,
  token,
  isLogin,
  setUser,
  toggleUserWish,
} from "./dataVariables";
import { errorHandler } from "./errorHandler";
import {
  categoryQuery,
  createCartMutation,
  updateCartMutation,
  getAccessMutation,
  productQuery,
  toggleWish,
  deleteCartMutation,
} from "./graphQueries";
import nextCookie from "next-cookies";
import Router from "next/router";
import { customNotifier } from "../components/customNotifier";

const url = "https://api-ecommerce.devtot.com/graphview/";

const link = createUploadLink({ uri: url });

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export const setAuthCookie = (authObj) => {
  cookie.set(token, JSON.stringify(authObj));
};

export const setIsLoginCookie = (status) => {
  cookie.set(isLogin, JSON.stringify(status));
};

export const parseCookie = (ctx) => {
  return nextCookie(ctx);
};

export const removeCookie = (name) => {
  cookie.remove(name);
};

export const getClientHeaders = (access) => {
  return {
    headers: {
      AUTHORIZATION: `JWT ${access}`,
    },
  };
};

export const getActiveToken = () => {
  return JSON.parse(cookie.get(token));
};

export const getNewToken = async (e, refresh) => {
  const errorContent = errorHandler(e);
  if (errorContent === expiredToken) {
    const newAccess = await client
      .mutate({
        mutation: getAccessMutation,
        variables: { refresh },
      })
      .catch((e) => removeCookie(token));

    if (newAccess) {
      const accessToken = newAccess.data.getAccess.access;
      setAuthCookie({ access: accessToken, refresh: refresh });
      return accessToken;
    }
    return null;
  }
  return null;
};

export const handleRouting = (path) => {
  Router.push(path);
};

export const logout = (dispatch) => {
  cookie.remove(token);
  cookie.remove(isLogin);
  dispatch({ type: setUser, payload: {} });
};

export const getCategories = async () => {
  const res = await client
    .query({
      query: categoryQuery,
    })
    .catch((e) =>
      customNotifier({
        type: "error",
        content: errorHandler(e),
      })
    );
  if (res) {
    return res.data.categories;
  }
  return res;
};

export const getProducts = async (variables) => {
  const res = await client
    .query({
      query: productQuery,
      variables,
    })
    .catch((e) => customNotifier({ type: "error", content: errorHandler(e) }));

  if (res) {
    const {
      results,
      total,
      size,
      current,
      hasNext,
      hasPrev,
    } = res.data.products;
    const pageInfo = {
      total,
      size,
      current,
      hasNext,
      hasPrev,
    };

    return { results, pageInfo };
  }
  return res;
};

export const addToWish = (productId, dispatch) => {
  dispatch({ type: toggleUserWish, payload: productId });
  const activeToken = getActiveToken();
  handleAddToWish(productId, activeToken.access, activeToken.refresh);
};

const handleAddToWish = async (productId, dispatch, access, refresh) => {
  try {
    await client.mutate({
      mutation: toggleWish,
      variables: {
        productId,
      },
      context: getClientHeaders(access),
    });
  } catch (e) {
    const errorInfo = errorHandler(e);
    if (errorInfo === expiredToken) {
      const newAccess = await getNewToken(e, refresh);
      if (newAccess) {
        setAuthCookie({ access: newAccess, refresh });
        handleAddToWish(productId, dispatch, newAccess, refresh);
      }
    } else {
      dispatch({ type: toggleUserWish, payload: productId });
    }
  }
};

export const addToCart = async (mainId, dispatch, userInfo, quantity = 1) => {
  const activeToken = getActiveToken();

  const product = userInfo.userCarts.filter((item) => item.id === mainId);
  if (product.length > 0) {
    const variables = {
      cartId: mainId,
      quantity,
    };
    const res = await handleCartRequest(
      mainId,
      quantity,
      activeToken.access,
      activeToken.refresh,
      updateCartMutation,
      variables
    );
    if (res) {
      customNotifier({ type: "success", content: "Cart updated successfully" });
      const data = res.updateCartItem.cartItem;
      const newUserCart = userInfo.userCarts.map((item) => {
        if (item.id === mainId) {
          return data;
        }
        return item;
      });
      dispatch({
        type: setUser,
        payload: { ...userInfo, userCarts: newUserCart },
      });
    }
  } else {
    const variables = {
      productId: mainId,
      quantity,
    };
    const res = await handleCartRequest(
      mainId,
      quantity,
      activeToken.access,
      activeToken.refresh,
      createCartMutation,
      variables
    );
    if (res) {
      const data = res.createCartItem.cartItem;
      const newUserInfo = {
        ...userInfo,
        userCarts: [...userInfo.userCarts, data],
      };
      dispatch({ type: setUser, payload: newUserInfo });
    }
  }
};

export const updateCart = async (cartId, quantity) => {
  const activeToken = getActiveToken();
  const variables = {
    cartId,
    quantity,
  };
  const res = await handleCartRequest(
    cartId,
    quantity,
    activeToken.access,
    activeToken.refresh,
    updateCartMutation,
    variables
  );
  if (res) {
    return true;
  }
  return False;
};

const handleCartRequest = async (
  productId,
  quantity,
  access,
  refresh,
  mutation,
  variables
) => {
  try {
    const res = await client.mutate({
      mutation,
      variables,
      context: getClientHeaders(access),
    });
    if (res) {
      return res.data;
    }
  } catch (e) {
    const errorInfo = errorHandler(e);
    if (errorInfo === expiredToken) {
      const newAccess = await getNewToken(e, refresh);
      if (newAccess) {
        setAuthCookie({ access: newAccess, refresh });
        handleCartRequest(
          productId,
          quantity,
          dispatch,
          newAccess,
          refresh,
          mutation,
          variables
        );
      }
    } else {
      customNotifier({ type: "error", content: errorInfo });
    }
  }
};

export const deleteFromCart = async (mainId, dispatch, userInfo) => {
  const activeToken = getActiveToken();

  const product = userInfo.userCarts.filter((item) => item.id === mainId);
  if (product.length < 1) {
    return;
  }

  const res = await handleCartDeleteRequest(
    mainId,
    activeToken.access,
    activeToken.refresh
  );
  if (res) {
    const newUserCart = userInfo.userCarts.filter((item) => item.id !== mainId);
    dispatch({
      type: setUser,
      payload: { ...userInfo, userCarts: newUserCart },
    });
  }
};

const handleCartDeleteRequest = async (cartId, access, refresh) => {
  try {
    const res = await client.mutate({
      mutation: deleteCartMutation,
      variables: { cartId },
      context: getClientHeaders(access),
    });
    if (res) {
      return res.data;
    }
  } catch (e) {
    const errorInfo = errorHandler(e);
    if (errorInfo === expiredToken) {
      const newAccess = await getNewToken(e, refresh);
      if (newAccess) {
        setAuthCookie({ access: newAccess, refresh });
        handleCartDeleteRequest(cartId, access, refresh);
      }
    }
  }
};
