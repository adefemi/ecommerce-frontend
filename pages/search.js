import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../components/customContext";
import { ProductCard } from "../components/generics";
import Layout from "../components/layout";
import { getProducts } from "../lib/network";
import styles from "../styles/generics.module.scss";
import Pagination from "kodobe-react-pagination";
import Dropdown from "kodobe-react-dropdown";

export default function Search() {
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [pageInformation, setPageInfo] = useState({});
  const [sort, setSort] = useState("latest");
  const [sorted, setSorted] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const {
    state: { search, sortGlobal },
  } = useContext(MyContext);

  useEffect(() => {
    fetchProducts();
  }, [search, sorted]);

  useEffect(() => {
    if (sortGlobal) {
      handleDropChange(sortGlobal);
    }
  }, []);

  const fetchProducts = async () => {
    const query = { ...sorted, search };
    setFetching(true);
    const res = await getProducts(query);
    if (res) {
      const { results, pageInfo } = res;
      setProducts(results);
      setPageInfo(pageInfo);
      setFetching(false);
    }
  };

  const handleDropChange = (e) => {
    switch (e) {
      case "latest":
        setSorted({ sortBy: "created_at", isAsc: false });
        break;
      case "oldest":
        setSorted({ sortBy: "created_at", isAsc: true });
        break;
      case "prizy":
        setSorted({ sortBy: "price", isAsc: false });
        break;
      case "leprizy":
        setSorted({ sortBy: "price", isAsc: true });
        break;
      default:
        return;
    }
    setSort(e);
  };

  return (
    <Layout hideFooter>
      {!fetching && (
        <div className={styles.section}>
          <div className={styles.sectionHeading}>
            <div className={styles.title}>
              {search && search !== "" && `RESULTS FOR ${search}: `}
              {pageInformation.size} ITEM(S) FOUND
            </div>
            <div className={styles.title}>
              SORT BY:{" "}
              <Dropdown
                value={sort}
                direction="right"
                title=""
                maxWidth={200}
                options={[
                  { title: "Latest", value: "latest" },
                  { title: "Oldest", value: "oldest" },
                  { title: "Highest Price", value: "prizy" },
                  { title: "Lowest Price", value: "leprizy" },
                ]}
                onChange={handleDropChange}
              />
            </div>
          </div>
          <div className={styles.sectionBody}>
            {products.map((item, id) => (
              <ProductCard data={item} key={id} />
            ))}
          </div>
          <br />
          <br />
          <Pagination
            totalPage={pageInformation.size}
            itemPerPage={10}
            currentPage={currentPage}
            onChangePage={(e) => setCurrentPage(e)}
          />
        </div>
      )}
    </Layout>
  );
}
