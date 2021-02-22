import React, { useState, useEffect } from "react";
import Layout from "../../components/layout";
import withAuth from "../../components/withAuth";
import styles from "../../styles/dashboardStyle.module.scss";
import {
  client,
  getClientHeaders,
  getNewToken,
  handleRouting,
} from "../../lib/network";
import { createBusinessMutation, meQuery } from "../../lib/graphQueries";
import { errorHandler } from "../../lib/errorHandler";
import { setUser } from "../../lib/dataVariables";
import { customNotifier } from "../../components/customNotifier";

function Dashboard(props) {
  const {
    userInfo: { userBusiness, firstName },
    tokenData: { access, refresh },
    dispatch,
  } = props;

  const [modalState, setModalState] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBusinessData, setUserBusinessData] = useState(userBusiness);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    handleSubmit(access);
  };

  const handleSubmit = async (tokenAccess) => {
    try {
      await client.mutate({
        mutation: createBusinessMutation,
        variables: { name },
        context: getClientHeaders(tokenAccess),
      });
    } catch (e) {
      const newAccess = getNewToken(e, refresh);
      if (!newAccess) {
        customNotifier({
          type: "error",
          content: errorHandler(e),
        });
        setLoading(false);
        return;
      } else {
        handleSubmit(newAccess);
      }
    }

    // if success get update user info

    const newUser = await client
      .query({
        query: meQuery,
        context: getClientHeaders(tokenAccess),
      })
      .catch((e) => console.log(errorHandler(e)));

    if (newUser) {
      dispatch({ type: setUser, payload: newUser.data.me });
    }
    customNotifier({
      type: "success",
      content: "Your Business was successfully created",
    });
    setModalState(false);
    setLoading(false);
  };

  useEffect(() => {
    if (userBusiness !== userBusinessData) {
      setUserBusinessData(userBusiness);
    }
  }, [userBusiness]);

  const getUserTitle = () => {
    if (userBusiness) {
      return userBusiness.name;
    }
    return firstName;
  };

  return (
    <>
      <Layout hideFooter>
        <div className={styles.greeting}>
          <h3>Hello {getUserTitle()}</h3>
          <p>How are you doing today!</p>
        </div>
        {userBusinessData ? (
          <HasBusiness />
        ) : (
          <NoBusiness openModal={() => setModalState(true)} />
        )}
      </Layout>
      {modalState && (
        <ModalComponent onClose={() => setModalState(false)}>
          <div className={styles.businessContainer}>
            <div className={styles.title}>CREATE A BUSINESS</div>
            <form onSubmit={submit}>
              <div className="input-field">
                <input
                  placeholder="Business name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={loading ? "loading disabled" : ""}
              >
                SUBMIT BUSINESS
              </button>
            </form>
          </div>
        </ModalComponent>
      )}
    </>
  );
}

export default withAuth(Dashboard);

const NoBusiness = ({ openModal }) => {
  return (
    <div className={styles.noBusiness}>
      <img src="/invalid.svg" />
      <p>
        Ops!, you need to create a business name first before you can add
        products
      </p>
      <button onClick={openModal}>CREATE BUSINESS</button>
    </div>
  );
};

const HasBusiness = () => {
  return (
    <div className={styles.hasBusiness}>
      <div className={styles.businessCard}>
        <img src="/service.svg" />
        <p>View Products</p>
      </div>
      <div className={styles.businessCard}>
        <img src="/cart.svg" />
        <p>View Requests</p>
      </div>
      <div
        onClick={() => handleRouting("/user/add-product")}
        className={`${styles.businessCard} ${styles.cardAdd}`}
      >
        <img src="/addWhite.svg" />
        <p>Add Product</p>
      </div>
    </div>
  );
};

const ModalComponent = ({ children, onClose }) => {
  return (
    <div className="modal">
      <div className="inner">
        <img src="/close.svg" className="close" onClick={onClose} />
        {children}
      </div>
    </div>
  );
};
