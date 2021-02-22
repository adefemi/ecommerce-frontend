import React, { useContext, useEffect } from "react";
import { isLogin } from "../lib/dataVariables";
import { parseCookie } from "../lib/network";
import Router from "next/router";
import { MyContext } from "./customContext";

const withAuth = (AuthComponent) => {
  const Wrapper = (props) => {
    const {
      state: { userInfo, tokenData },
      dispatch,
    } = useContext(MyContext);

    useEffect(() => {
      if (!userInfo || !userInfo.id || !tokenData) {
        Router.push(`/login?redirect=${document.location.pathname}`);
      }
    }, [userInfo]);

    if (!userInfo || !userInfo.id || !tokenData) {
      return <div />;
    }

    return (
      <AuthComponent
        userInfo={userInfo}
        tokenData={tokenData}
        dispatch={dispatch}
        {...props}
      />
    );
  };

  Wrapper.getInitialProps = async (ctx) => {
    const isLoginState = parseCookie(ctx)[isLogin];
    if (!isLoginState) {
      const { req, res } = ctx;

      if (req) {
        const url = `/login?redirect=${req.url}`;
        res.writeHead(301, { Location: url });
        res.end();
      } else {
        const url = `/login?redirect=${document.location.pathname}`;
        Router.push(url);
      }
    }

    const appProps = {};
    if (AuthComponent.getInitialProps) {
      appProps = await AuthComponent.getInitialProps(ctx);
    }
    return { ...appProps };
  };

  return Wrapper;
};

export default withAuth;
