import React, { useEffect } from "react";
import Router from "next/router";

import useRequest from "../hooks/use-request";

function SignOut() {
  const { doRequest, errors } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return (
    <div>
      <h1>Signing you out...</h1>
      {errors}
    </div>
  );
}

export default SignOut;
