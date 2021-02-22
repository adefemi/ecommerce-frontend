import React, { useState, useContext } from "react";
import AuthComponent from "../components/authComponent";
import {
  client,
  parseCookie,
  setAuthCookie,
  setIsLoginCookie,
} from "../lib/network";
import { LoginMutation } from "../lib/graphQueries";
import { errorHandler } from "../lib/errorHandler";
import { customNotifier } from "../components/customNotifier";
import Router, { useRouter } from "next/router";
import { isLogin, setUser, setTokenData } from "../lib/dataVariables";
import { MyContext } from "../components/customContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { dispatch } = useContext(MyContext);

  const submit = async (e, data) => {
    e.preventDefault();
    setLoading(true);
    const result = await client
      .mutate({
        mutation: LoginMutation,
        variables: data,
      })
      .catch((e) =>
        customNotifier({ type: "error", content: errorHandler(e) })
      );

    if (result) {
      const { access, refresh, user } = result.data.loginUser;

      dispatch({ type: setUser, payload: user });
      dispatch({ type: setTokenData, payload: { access, refresh } });

      setAuthCookie({ access, refresh });
      const redirect = router.query["redirect"];
      let url = "/";
      if (redirect) {
        url = redirect;
      }
      setIsLoginCookie(true);
      Router.push(url);
      // setTimeout(() => , 1000);
    } else {
      setLoading(false);
    }
  };

  return (
    <AuthComponent
      title="Login"
      content="Don’t have an account yet?"
      login
      onSubmit={submit}
      loading={loading}
    />
  );
};

export const getServerSideProps = async (ctx) => {
  const isLoginState = parseCookie(ctx)[isLogin];
  if (isLoginState) {
    const { query } = ctx;
    const redirect = query["redirect"];
    let url = "/";
    if (redirect) {
      url = redirect;
    }
    return {
      redirect: {
        destination: url,
      },
    };
  }
  return {
    props: {},
  };
};

export default Login;
