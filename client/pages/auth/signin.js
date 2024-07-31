import React from "react";
import Router from "next/router";

import useRequest from "../hooks/use-request";

function Signin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: { email, password },
    onSuccess: () => Router.push("/"),
  });

  async function onSubmit(event) {
    try {
      event.preventDefault();
      await doRequest();
    } catch (err) {
      console.log(err.response?.data?.errors || err.message);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1> Sign In</h1>
      <div>
        <label>Email Address</label>
        <input
          // type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          //   required
          className="form-control"
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          //   required
          className="form-control"
        />
      </div>
      {errors}
      <button className="btn btn-primary">Sign In</button>
    </form>
  );
}

export default Signin;
