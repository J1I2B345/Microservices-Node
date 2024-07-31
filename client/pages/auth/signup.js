import React from "react";
import Router from "next/router";

import useRequest from "../hooks/use-request";

function Signup() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  //   const [errors, setErrors] = React.useState([]);

  const { doRequest, errors } = useRequest({
    url: "/api/users/signup",
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
      <h1> Sign Up</h1>
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
      <button className="btn btn-primary">Sign up</button>
    </form>
  );
}

export default Signup;
