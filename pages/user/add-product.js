import React, { useState, useContext, useEffect } from "react";
import { MyContext } from "../../components/customContext";
import { customNotifier } from "../../components/customNotifier";
import { ImageSelector } from "../../components/generics";
import Layout from "../../components/layout";
import withAuth from "../../components/withAuth";
import { expiredToken, setCategory } from "../../lib/dataVariables";
import { errorHandler } from "../../lib/errorHandler";
import { createProductMutation } from "../../lib/graphQueries";
import {
  client,
  getActiveToken,
  getCategories,
  getClientHeaders,
  getNewToken,
  setAuthCookie,
} from "../../lib/network";
import styles from "../../styles/singleProductStyle.module.scss";
import Router from "next/router";

function AddProduct() {
  const [imageList, setImageList] = useState([]);
  const [categorys, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [productData, setProductData] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

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

  const handleImageUpload = (imageObj) => {
    const { id, isCover } = imageObj;
    setImageList([...imageList, { imageId: id, isCover }]);
  };

  const submit = (e) => {
    e.preventDefault();

    setLoading(true);
    const activeToken = getActiveToken();
    handleSubmit(activeToken.access, activeToken.refresh);
  };

  const handleSubmit = async (access, refresh) => {
    try {
      await client.mutate({
        mutation: createProductMutation,
        variables: {
          images: imageList,
          productData,
          totalCount: parseInt(totalCount),
        },
        context: getClientHeaders(access),
      });
      setLoading(false);
      customNotifier({
        type: "success",
        content: "Product Add Successfully",
      });
      Router.push("/user/products");
    } catch (e) {
      const errorInfo = errorHandler(e);
      if (errorInfo === expiredToken) {
        const newAccess = await getNewToken(e, refresh);
        if (newAccess) {
          setAuthCookie({ access: newAccess, refresh });
          handleSubmit(newAccess, refresh);
        }
      } else {
        customNotifier({
          type: "error",
          content: errorInfo,
        });
        setLoading(false);
      }
    }
  };

  return (
    <Layout hideFooter>
      <div className={styles.container}>
        <div className={styles.headerLinks}>
          <div className={styles.linkItem}>Home</div>
          <img src="/chevron-right.svg" />
          <div className={styles.linkItem}>Phones</div>
          <img src="/chevron-right.svg" />
          <div className={styles.linkItem}>Samsungs Note 20 Ultra</div>
        </div>
      </div>

      <form onSubmit={submit}>
        <div className={styles.productContainer}>
          <div className={styles.LeftCon}>
            <div className="input-field">
              <input
                placeholder="Name"
                name="name"
                type="text"
                value={productData["name"] || ""}
                onChange={onChange}
                required
              />
            </div>
            <div className="input-field">
              <input
                placeholder="Price"
                name="price"
                type="number"
                value={productData["price"] || ""}
                onChange={onChange}
                required
              />
            </div>
            <div className="input-grid">
              <div className="input-field">
                <select
                  name="categoryId"
                  value={productData["categoryId"] || ""}
                  onChange={onChange}
                  required
                >
                  <option value="">Select category...</option>
                  {fetching && <option>Loading...</option>}
                  {categorys.map((item, i) => (
                    <option value={item.id} key={i}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <input
                  placeholder="Total Count"
                  name="totalCount"
                  value={totalCount}
                  onChange={(e) => setTotalCount(e.target.value)}
                  type="number"
                  required
                />
              </div>
            </div>
            <textarea
              placeholder="Description"
              value={productData["description"] || ""}
              name="description"
              onChange={onChange}
            ></textarea>
          </div>
          <div className={styles.RightCon}>
            <div className={styles.MainImage}>
              <ImageSelector
                handleImageUpload={handleImageUpload}
                cover
                title="cover image"
              />
            </div>
            <div className={styles.OtherImages}>
              <ImageSelector handleImageUpload={handleImageUpload} />
              <ImageSelector handleImageUpload={handleImageUpload} />
              <ImageSelector handleImageUpload={handleImageUpload} />
              <ImageSelector handleImageUpload={handleImageUpload} />
              <ImageSelector handleImageUpload={handleImageUpload} />
              <ImageSelector handleImageUpload={handleImageUpload} />
            </div>
          </div>
        </div>
        <button
          disabled={loading}
          type="submit"
          className={`${styles.createButton} ${
            loading ? "loading disabled" : ""
          }`}
        >
          Create Product
        </button>
      </form>
    </Layout>
  );
}

export default withAuth(AddProduct);
