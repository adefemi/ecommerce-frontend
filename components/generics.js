import React, { useContext, useRef, useState, useEffect } from "react";
import { errorHandler } from "../lib/errorHandler";
import { uploadImageMutation } from "../lib/graphQueries";
import { client, addToWish, addToCart, deleteFromCart } from "../lib/network";
import styles from "../styles/generics.module.scss";
import { customNotifier } from "./customNotifier";
import Router from "next/router";
import { MyContext } from "./customContext";
import moment from "moment";

export const ProductCard = ({ data }) => {
  const [{ name, id, price, productImages }] = useState(data);
  const [canAdd, setCanAdd] = useState(true);
  const [canRemove, setCanRemove] = useState(false);
  const [mainId, setMainId] = useState(id);
  const [hasWish, setHasWish] = useState(false);
  const {
    dispatch,
    state: { userInfo },
  } = useContext(MyContext);

  useEffect(() => {
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

    handleUserCarts();
  }, [userInfo]);

  const getCoverImage = (images) => {
    let image = "";
    for (let i of images) {
      if (i.isCover) {
        image = i.image.image;
        break;
      }
    }
    return image;
  };

  const handleProductClick = () => {
    Router.push(`/product/${id}`);
  };

  const handleAddToCart = () => {
    if (!userInfo) {
      customNotifier({
        type: "error",
        content: "You need to be logged in to perform operation",
      });
      return;
    }
    addToCart(mainId, dispatch, userInfo);
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
    if (!userCarts) return;
    let cart = userCarts.filter((item) => item.product.id === id);
    if (cart.length > 0) {
      cart = cart[0];
      setMainId(cart.id);
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

  return (
    <div className={styles.productCard}>
      <div className={styles.productCover} onClick={handleProductClick}>
        <img src={getCoverImage(productImages)} alt="" />
      </div>
      <div className={styles.productContent}>
        <div className={styles.productTopContent}>
          <div className={styles.productPrice}>${price}</div>
          <div className={styles.productReaction}>
            {canRemove && (
              <>
                <img src="/minus.svg" onClick={removeFromCart} />
              </>
            )}
            {canAdd && <img src="/add.svg" onClick={handleAddToCart} />}
            <img
              src={hasWish ? "/favColoured.svg" : "/favorite.svg"}
              onClick={() => addToWish(id, dispatch)}
            />
          </div>
        </div>
        <div className={styles.productInformation} onClick={handleProductClick}>
          {name}
        </div>
      </div>
    </div>
  );
};

export const ProductCardOwned = ({ data, deleteProduct }) => {
  const [
    { name, id, price, productImages, totalAvailable, createdAt },
  ] = useState(data);

  const getCoverImage = (images) => {
    let image = "";
    for (let i of images) {
      if (i.isCover) {
        image = i.image.image;
        break;
      }
    }
    return image;
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productCover}>
        <img src={getCoverImage(productImages)} alt="" />
      </div>
      <div className={styles.productContent}>
        <div className={styles.productTopContent}>
          <div className={styles.productPrice}>${price}</div>
          <div className={styles.productReaction}>
            <img src="/delete.svg" onClick={() => deleteProduct(id)} />
          </div>
        </div>
        <div className={styles.productInformation}>{name}</div>
        <small>{totalAvailable} item(s) remaining</small>
        <small>Added {moment(createdAt).format("DD-MM-YYYY")}</small>
      </div>
    </div>
  );
};

export const CategoryCard = ({ data, onClick }) => {
  const { name, count } = data;
  return (
    <div className={styles.categoryCard} onClick={() => onClick(name)}>
      <div className={styles.categoryContent}>
        <h3>{name}</h3>
        <p>{count} item(s) available</p>
      </div>
    </div>
  );
};

export const HomeSection = ({ title, canShowAll, onShowAll, children }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeading}>
        <div className={styles.title}>{title}</div>
        {canShowAll && (
          <div className={styles.link} onClick={onShowAll}>
            Show All
          </div>
        )}
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  );
};

export const CommentItem = (commentData) => {
  return (
    <div className={styles.commentItem}>
      <p>
        Good Product, Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Turpis enim sit non arcu elementum. Mauris malesuada dictumst ante
        aliquam amet, quis adipiscing.
      </p>
      <div className={styles.footer}>
        <div className={styles.title}>Allan Smith</div>
        <div className={styles.title}>12-01-2021</div>
      </div>
    </div>
  );
};

export const CartCard = ({ data, handleQuantityChange }) => {
  const {
    quantity,
    id,
    product: { totalAvailable, name, price, productImages },
  } = data;

  const getCoverImage = (images) => {
    let image = "";
    for (let i of images) {
      if (i.isCover) {
        image = i.image.image;
        break;
      }
    }
    return image;
  };

  return (
    <div className={styles.CartCard}>
      <div className={styles.leftCartItem}>
        <div className={styles.cartCover}>
          <img src={getCoverImage(productImages)} alt="" />
        </div>
      </div>
      <div className={styles.middleCartItem}>{name}</div>
      <div className={styles.rightCartItem}>
        <div className={styles.cartItemPrize}>${price}</div>
        <QuantityPicker
          quantity={quantity}
          maxAvailable={totalAvailable}
          onChange={(e) => handleQuantityChange(id, e)}
        />
      </div>
    </div>
  );
};

export const FeeItem = ({ title, prize }) => {
  return (
    <div className={styles.FeeCard}>
      <div className={styles.feeTitle}>{title}</div>
      <div className={styles.feeContent}>{prize}</div>
    </div>
  );
};

export const QuantityPicker = ({ maxAvailable, quantity, onChange }) => {
  const getOptions = () => {
    const optionList = [];

    for (let i = 1; i <= maxAvailable; i++) {
      optionList.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return optionList;
  };

  return (
    <div className={styles.quantitySelector}>
      <small>QTY</small>
      <select value={quantity} onChange={(e) => onChange(e.target.value)}>
        {getOptions()}
      </select>
    </div>
  );
};

export const RequestCard = ({ data }) => {
  const {
    quantity,
    product: { name, price, productImages },
    user: { firstName, lastName },
  } = data;

  const getCoverImage = (images) => {
    let image = "";
    for (let i of images) {
      if (i.isCover) {
        image = i.image.image;
        break;
      }
    }
    return image;
  };

  return (
    <div className={styles.RequestCard}>
      <div className={styles.leftRequest}>
        <div className={styles.requestCover}>
          <img src={getCoverImage(productImages)} alt="" />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>{name}</div>
          <div className={styles.downItem}>
            {/* <div className={styles.address}>
              Address: No 14, Allen Street, Treasure District
            </div> */}
            <div className={styles.contact}>
              From: {`${firstName} ${lastName}`}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.rightRequest}>
        <div className={styles.Prize}>${price}</div>
        <div className={styles.count}>{quantity} Item(s)</div>
      </div>
    </div>
  );
};

export const ImageSelector = ({
  title = "image",
  cover = false,
  handleImageUpload,
}) => {
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [imageObj, setImageObj] = useState(null);

  const handleChange = async (e) => {
    const image = e.target.files[0];
    setLoading(true);
    const result = await client
      .mutate({
        mutation: uploadImageMutation,
        variables: { image },
      })
      .catch((e) =>
        customNotifier({
          type: "error",
          content: errorHandler(e),
        })
      );

    if (result) {
      setImageObj(result.data.imageUpload.image);
      handleImageUpload({ ...result.data.imageUpload.image, isCover: cover });
    }
    setLoading(false);
  };

  const handleClick = () => {
    if (loading) return;
    fileRef.current.value = null;
    fileRef.current.click();
  };

  return (
    <>
      {imageObj ? (
        <div
          src={imageObj.image}
          className={`${styles.ImageLoaded} ${
            loading ? styles.imageLoading : ""
          }`}
          style={{ backgroundImage: `url('${imageObj.image}')` }}
          onClick={handleClick}
        />
      ) : (
        <div
          className={`${styles.ImageSelector} ${
            loading ? styles.imageLoading : ""
          }`}
          onClick={handleClick}
        >
          {title}
        </div>
      )}
      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </>
  );
};
