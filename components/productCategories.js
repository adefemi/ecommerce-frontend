import React, { useContext, useState, useEffect } from "react";
import { setCategory, setSearch } from "../lib/dataVariables";
import { getCategories } from "../lib/network";
import { MyContext } from "./customContext";
import { CategoryCard, HomeSection } from "./generics";
import Router from "next/router";

export default function ProductCategories() {
  const [categorys, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);

  const {
    state: { categories },
    dispatch,
  } = useContext(MyContext);

  useEffect(() => {
    if (categories) {
      setCategories(categories);
      setFetching(false);
    } else {
      fetchCategories();
    }
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();

    if (res) {
      setCategories(res);
      dispatch({ type: setCategory, payload: res });
      setFetching(false);
    }
  };

  const handleOnClick = (name) => {
    dispatch({ type: setSearch, payload: name });
    Router.push("/search");
  };

  return (
    <HomeSection title="CATEGORIES">
      {!fetching &&
        categorys.map((item, id) => (
          <CategoryCard onClick={handleOnClick} data={item} key={id} />
        ))}
    </HomeSection>
  );
}
