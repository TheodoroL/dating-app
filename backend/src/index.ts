import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { env } from "./libs/schema/env.js";
import { authRouter } from "./router/auth.route.js";
import { likeRouter } from "./router/like.route.js";
import { messageRouter } from "./router/message.route.js";
import { userRouter } from "./router/user.route.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(import.meta.dirname, "../uploads")));
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/likes", likeRouter);
app.use("/matches", messageRouter);

app.listen(env.PORT, () => {
  console.log("Server is running on port", env.PORT);
});
