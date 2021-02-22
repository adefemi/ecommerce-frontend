import "../styles/global.scss";
import { token } from "../lib/dataVariables";
import { meQuery } from "../lib/graphQueries";
import {
  client,
  getClientHeaders,
  getNewToken,
  parseCookie,
  setIsLoginCookie,
} from "../lib/network";
import ContextComponent from "../components/customContext";
import App from "next/app";

function MyApp({ Component, pageProps, userData, token }) {
  return (
    <ContextComponent initialValue={{ userInfo: userData, tokenData: token }}>
      <Component {...pageProps} />
    </ContextComponent>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const { ctx } = appContext;
  const tokenData = parseCookie(ctx)[token];

  let loggedInState = false;
  let result = null;

  const getUser = (access) => {
    return client.query({
      query: meQuery,
      context: getClientHeaders(access),
    });
  };

  if (tokenData && tokenData["access"]) {
    try {
      result = await getUser(tokenData["access"]);
    } catch (e) {
      const newAccess = await getNewToken(e, tokenData["refresh"]);
      if (newAccess) {
        result = await getUser(newAccess);
        tokenData["access"] = newAccess;
      }
    }
  }

  let userData = null;
  const appProps = await App.getInitialProps(appContext);

  if (result) {
    userData = result.data.me;
    loggedInState = true;
  }
  setIsLoginCookie(loggedInState);
  client.resetStore();
  return {
    ...appProps,
    userData: userData,
    token: tokenData,
  };
};

export default MyApp;
