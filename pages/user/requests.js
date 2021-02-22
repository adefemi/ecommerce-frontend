import React, { useState, useEffect, useContext } from "react";
import { RequestCard } from "../../components/generics";
import { requestCartQuery } from "../../lib/graphQueries";
import Layout from "../../components/layout";
import withAuth from "../../components/withAuth";
import styles from "../../styles/singleProductStyle.module.scss";
import { MyContext } from "../../components/customContext";
import { client, getClientHeaders } from "../../lib/network";
import { customNotifier } from "../../components/customNotifier";

function Requests() {
  const [requests, setRequest] = useState([]);
  const [fetching, setFetching] = useState(true);

  const {
    state: { tokenData },
  } = useContext(MyContext);

  useEffect(() => {
    fetchRequest();
  }, []);

  const fetchRequest = async () => {
    const res = await client
      .query({
        query: requestCartQuery,
        context: getClientHeaders(tokenData.access),
      })
      .catch((e) =>
        customNotifier({ type: "error", content: errorHandler(e) })
      );
    if (res) {
      console.log(res.data.requestCarts);
      setRequest(res.data.requestCarts);
      setFetching(false);
    }
  };

  if (fetching) {
    return <div />;
  }

  return (
    <Layout hideFooter>
      <br />
      <div>
        {requests.map((item, key) => (
          <RequestCard data={item} key={key} />
        ))}
      </div>
    </Layout>
  );
}

export default withAuth(Requests);
