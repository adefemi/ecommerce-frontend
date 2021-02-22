import React, { useEffect, useState, useContext } from "react";
import { QuantityPicker } from "../../components/generics";
import Layout from "../../components/layout";
import styles from "../../styles/singleProductStyle.module.scss";
import {
  addToCart,
  addToWish,
  client,
  deleteFromCart,
} from "../../lib/network";
import { singleProductQuery } from "../../lib/graphQueries";
import { customNotifier } from "../../components/customNotifier";
import ProductComponent from "../../components/productComponent";
import { MyContext } from "../../components/customContext";

export default function SingleProductPage({ activeProduct, id }) {
  const [canAdd, setCanAdd] = useState(true);
  const [canRemove, setCanRemove] = useState(false);
  const [mainId, setMainId] = useState(id);
  const [hasWish, setHasWish] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const {
    dispatch,
    state: { userInfo },
  } = useContext(MyContext);

  useEffect(() => {
    if (!activeProduct) {
      customNotifier({
        type: "error",
        content: "This product do not exist any longer",
      });
      Router.push("/");
    }
  }, []);

  useEffect(() => {
    handleUserWish();
    handleUserCarts();
  }, [userInfo]);

  const handleUserWish = () => {
    if (userInfo && userInfo.userWish) {
      const { userWish } = userInfo;
      const checkHasWish = userWish.products.filter((item) => item.id === id);
      if (checkHasWish.length > 0) {
        setHasWish(true);
      } else {
        setHasWish(false);
      }
    } else {
      setHasWish(false);
    }
  };

  const handleAddToCart = () => {
    if (!userInfo) {
      customNotifier({
        type: "error",
        content: "You need to be logged in to perform operation",
      });
      return;
    }
    addToCart(mainId, dispatch, userInfo, quantity);
  };

  const removeFromCart = () => {
    if (!userInfo) {
      customNotifier({
        type: "error",
        content: "You need to be logged in to perform operation",
      });
      return;
    }
    deleteFromCart(mainId, dispatch, userInfo);
  };

  const handleUserCarts = () => {
    if (!userInfo) return;

    const { userCarts } = userInfo;
    let cart = userCarts.filter((item) => item.product.id === id);
    if (cart.length > 0) {
      cart = cart[0];
      setMainId(cart.id);
      setQuantity(cart.quantity);
      setCanRemove(true);

      if (cart.product.totalCount <= cart.quantity) {
        setCanAdd(false);
      } else {
        setCanAdd(true);
      }
    } else {
      setMainId(id);
      setCanRemove(false);
      setCanAdd(true);
    }
  };

  if (!activeProduct) return <div />;

  const {
    data: { product },
  } = activeProduct;

  const { productImages } = product;

  const getCover = () => {
    let image = "";
    for (let i of productImages) {
      if (i.isCover) {
        image = i.image.image;
        break;
      }
    }
    return image;
  };

  const getOtherImages = () => {
    let image = [];
    for (let i of productImages) {
      if (!i.isCover) {
        image.push(i.image.image);
      }
    }
    return image;
  };

  return (
    <Layout hideFooter>
      <div className={styles.container}>
        <div className={styles.headerLinks}>
          <div className={styles.linkItem}>Home</div>
          <img src="/chevron-right.svg" />
          <div className={styles.linkItem}>{product.category.name}</div>
          <img src="/chevron-right.svg" />
          <div className={styles.linkItem}>
            {product.name.length > 30
              ? product.name.substring(0, 30)
              : product.name}
          </div>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.rightItem}>
            <div className={styles.mainCover}>
              <img src={getCover()} alt="" />
            </div>
            <div className={styles.imageSliders}>
              {getOtherImages().map((item, id) => (
                <img key={id} src={item} alt="" />
              ))}
            </div>
          </div>
          <div className={styles.leftItem}>
            <div className={styles.title}>{product.name}</div>
            <div className={styles.listedBy}>
              BY <strong>{product.business.name}</strong>
            </div>
            <div className={styles.prizeInfo}>
              <h3>${product.price}</h3>
              <small>SAVE 12%, INCLUSIVE OF ALL TAXES</small>
            </div>
            {product.totalAvailable > 0 ? (
              <div className={styles.purchaseInfo}>
                <QuantityPicker
                  maxAvailable={product.totalAvailable}
                  quantity={quantity}
                  onChange={(e) => setQuantity(e)}
                />
                <div className={styles.controlButton}>
                  {canAdd && (
                    <button onClick={handleAddToCart}>
                      {canRemove ? "UPDATE" : "ADD TO"} CART
                    </button>
                  )}
                  {canRemove && (
                    <button
                      onClick={removeFromCart}
                      className={styles.removeButton}
                    >
                      <img src="/close.svg" />
                    </button>
                  )}
                </div>
                <img
                  src={hasWish ? "/favColoured.svg" : "/favorite.svg"}
                  onClick={() => addToWish(id, dispatch)}
                />
              </div>
            ) : (
              <div>No more product available </div>
            )}

            <div className={styles.description}>
              <div className={styles.descTitle}>DESCRIPTION</div>
              <p>{product.description}</p>
            </div>
            {/* <div className={styles.comments}>
              <div className={styles.commentsHeader}>
                <div className={styles.commentTitle}>COMMENTS - 20</div>
                <div className={styles.link}>SHOW ALL</div>
              </div>
              <CommentItem />
            </div> */}
          </div>
        </div>
      </div>
      <ProductComponent
        title="SIMILAR PRODUCT"
        tag="similar"
        category={product.category.name}
      />
    </Layout>
  );
}

SingleProductPage.getInitialProps = async (ctx) => {
  const { query } = ctx;
  let id = query.id;

  const res = await client
    .query({
      query: singleProductQuery,
      variables: { id },
    })
    .catch((e) => null);

  return { activeProduct: res, id };
};
