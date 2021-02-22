import React, { useReducer } from "react";
import {
  setUser,
  setCategory,
  setSearch,
  setSort,
  toggleUserWish,
  setTokenData,
} from "../lib/dataVariables";

export const MyContext = React.createContext({});

const myReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case setUser:
      return {
        ...state,
        userInfo: payload,
      };
    case setTokenData:
      return {
        ...state,
        tokenData: payload,
      };
    case setCategory:
      return {
        ...state,
        categories: payload,
      };
    case setSearch:
      return {
        ...state,
        search: payload,
      };
    case setSort:
      return {
        ...state,
        sortGlobal: payload,
      };
    case toggleUserWish:
      if (!state.userInfo) return { state };
      let { userWish } = state.userInfo;
      if (userWish) {
        let hasProduct = userWish.products.filter(
          (item) => item.id === payload
        );
        if (hasProduct.length > 0) {
          let products = userWish.products.filter(
            (item) => item.id !== payload
          );
          userWish = { ...userWish, products };
        } else {
          userWish = { products: [...userWish.products, { id: payload }] };
        }
      } else {
        userWish = { products: [{ id: payload }] };
      }
      const newUserInfo = { ...state.userInfo, userWish };

      return {
        ...state,
        userInfo: newUserInfo,
      };
    default:
      console.log("No action type specified");
  }
};

const ContextComponent = ({ initialValue, children }) => {
  const [state, dispatch] = useReducer(myReducer, initialValue);

  return (
    <MyContext.Provider value={{ state, dispatch }}>
      {children}
    </MyContext.Provider>
  );
};

export default ContextComponent;
