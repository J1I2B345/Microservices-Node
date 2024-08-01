import "bootstrap/dist/css/bootstrap.min.css";

import buildClient from "./api/build-client";
import Header from "./components/header";

export default function AppComponent({ Component, pageProps, currentUser }) {
  console.log("testing workflow");
  return (
    <div>
      <h1> email {currentUser?.email}</h1>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </div>
  );
}

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};
  if (appContext?.Component?.getInitialProps) {
    console.log("calling getInitialProps from AppComponent child");
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }
  return { pageProps, ...data };
};
