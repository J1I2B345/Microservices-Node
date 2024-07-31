import React, { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";
import useRequest from "../hooks/use-request";

function OrderShow({ order, currentUser }) {
  console.log("order", order);
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => {
      console.log("payment", payment);
      return Router.push("/orders");
    },
  });

  useEffect(() => {
    const findTimeLeft = () => {
      console.log("order.expiresAt", order.expiresAt);
      console.log("new Date", new Date());
      const msLeft = new Date(order.expiresAt) - new Date();
      console.log("msLeft", msLeft);
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const interval = setInterval(findTimeLeft, 1000);
    return () => {
      console.log("clearing interval");
      clearInterval(interval);
    };
  }, []);
  console.log("NEXT_PUBLIC_API_KEY", process.env.NEXT_PUBLIC_API_KEY);
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }
  return (
    <div>
      <h1>Order Details</h1>
      <h4>Order Expires In: {timeLeft} seconds</h4>
      <StripeCheckout
        token={(token) => {
          console.log("id", token.id);
          console.log("token", token);
          return doRequest({ token: token.id });
        }}
        stripeKey={process.env.NEXT_PUBLIC_API_KEY}
        amount={order?.ticket?.price * 100}
        email={currentUser?.email}
      />
      {errors}
    </div>
  );
}
// STRIPE TESTING CARDS
// 4242 4242 4242 4242
// 12/26
// 123

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  console.log("order in get intiial props", data);
  return { order: data };
};
export default OrderShow;
