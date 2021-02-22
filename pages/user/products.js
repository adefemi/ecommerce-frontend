import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../components/customContext";
import { customNotifier } from "../../components/customNotifier";
import { ProductCardOwned } from "../../components/generics";
import Layout from "../../components/layout";
import withAuth from "../../components/withAuth";
import { errorHandler } from "../../lib/errorHandler";
import { deleteProductMutation, productQuery } from "../../lib/graphQueries";
import { client, getClientHeaders } from "../../lib/network";
import styles from "../../styles/singleProductStyle.module.scss";

function Products() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);

  const {
    state: { tokenData },
  } = useContext(MyContext);

  useEffect(() => {
    fetchProduct();
  }, []);

  const deleteProduct = (productId) => {
    client
      .mutate({
        mutation: deleteProductMutation,
        variables: { productId },
        context: getClientHeaders(tokenData.access),
      })
      .catch((e) =>
        customNotifier({ type: "error", content: errorHandler(e) })
      );

    const newProducts = products.filter((item) => item.id !== productId);
    setProducts(newProducts);
  };

  const fetchProduct = async () => {
    const res = await client
      .query({
        query: productQuery,
        variables: { mine: true },
        context: getClientHeaders(tokenData.access),
      })
      .catch((e) =>
        customNotifier({ type: "error", content: errorHandler(e) })
      );
    if (res) {
      setProducts(res.data.products.results);
      setFetching(false);
    }
  };

  if (fetching) {
    return <div />;
  }

  return (
    <Layout hideFooter>
      <br />
      <div className={styles.productGroup}>
        {products.map((item, key) => (
          <ProductCardOwned
            deleteProduct={deleteProduct}
            data={item}
            key={key}
          />
        ))}
      </div>
    </Layout>
  );
}

export default withAuth(Products);
