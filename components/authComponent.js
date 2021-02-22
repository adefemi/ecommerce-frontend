import React, { useState } from "react";
import authStyle from "../styles/authStyle.module.scss";
import Router from "next/router";

const AuthComponent = ({
  title,
  content,
  login,
  onSubmit,
  loading,
  acceptedTerms = true,
  setAcceptedTerms,
}) => {
  const [data, setData] = useState({});

  const onChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const routeToPage = (page) => {
    switch (page) {
      case "home":
        Router.push("/");
        break;
      default:
        if (login) {
          Router.push("/register");
        } else {
          Router.push("/login");
        }
    }
  };

  return (
    <div
      className={authStyle.authMain}
      style={{ backgroundImage: "url(/bg.png)" }}
    >
      <div className={authStyle.inner}>
        <center>
          <div className="logo" onClick={() => routeToPage("home")}>
            ECOMMERCE
          </div>
        </center>
        <div className={authStyle.formContainer}>
          <h3 className={authStyle.h3}>{title}</h3>
          <p className={authStyle.p} onClick={routeToPage}>
            {content} <a>{login ? "Sign up" : "Sign in"}</a>
          </p>
          <form onSubmit={(e) => onSubmit(e, data)}>
            <div className="input-field">
              <input
                placeholder="Email"
                name="email"
                type="email"
                value={data["email"] || ""}
                onChange={onChange}
                required
              />
            </div>
            {!login && (
              <div className="input-field">
                <input
                  placeholder="First Name"
                  name="firstName"
                  type="text"
                  value={data["firstName"] || ""}
                  onChange={onChange}
                  required
                />
                <input
                  placeholder="Last Name"
                  name="lastName"
                  type="text"
                  value={data["lastName"] || ""}
                  onChange={onChange}
                  required
                />
              </div>
            )}
            <div className="input-field">
              <input
                placeholder="Password"
                name="password"
                type="password"
                value={data["password"] || ""}
                onChange={onChange}
                required
              />
              {!login && (
                <input
                  placeholder="Confirm Password"
                  name="cpassword"
                  type="password"
                  value={data["cpassword"] || ""}
                  onChange={onChange}
                  required
                />
              )}
            </div>
            {!login && (
              <div className={authStyle.confirmation}>
                <input
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  type="checkbox"
                ></input>
                <p>
                  I have read and agree to the <a>Terms of Service</a>
                </p>
              </div>
            )}
            <button
              disabled={loading || !acceptedTerms}
              type="submit"
              className={`${authStyle.authButton} ${
                loading ? "loading disabled" : ""
              } ${!acceptedTerms ? "disabled" : ""}`}
            >
              {login ? "SIGN IN" : "SIGN UP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
