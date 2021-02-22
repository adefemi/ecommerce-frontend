import React, { useContext, useEffect, useState } from "react";
import { setSearch, setSort } from "../lib/dataVariables";
import { getProducts } from "../lib/network";
import { MyContext } from "./customContext";
import { HomeSection, ProductCard } from "./generics";
import Router from "next/router";

export default function ProductComponent({ title, tag, category }) {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);

  const { dispatch } = useContext(MyContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const variables = {};
    if (category) {
      variables.category = category;
    }

    const result = await getProducts(variables);

    if (result) {
      const { results } = result;
      setProducts(results);
      setFetching(false);
    }
  };

  const handleOnClick = () => {
    if (category) {
      dispatch({ type: setSearch, payload: category });
    } else {
      dispatch({ type: setSort, payload: tag });
    }
    Router.push("/search");
  };

  return (
    <HomeSection title={title} canShowAll onShowAll={handleOnClick}>
      {!fetching &&
        products.map((item, id) => <ProductCard data={item} key={id} />)}
    </HomeSection>
  );
}
