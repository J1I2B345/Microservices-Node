import express from "express";
import { json } from "body-parser";
import "express-async-errors";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@jbev/common";
import { createChargeRotuer } from "./routes/new";

// 
export const app = express();

// this is because we are using ingress-nginx
app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.get("/api/payments/health", (req, res) => {
  res.send({ status: "ok" });
});

app.use(currentUser);

app.use(createChargeRotuer)

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);
