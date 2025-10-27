import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./libs/schema/env.js";
import { authRouter } from "./router/auth.route.js";
import { userRouter } from "./router/user.route.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(env.PORT, () => {
  console.log("Server is running on port", env.PORT);
});
