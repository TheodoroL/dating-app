import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { env, getFrontendUrl } from "./libs/schema/env.js";
import { authRouter } from "./router/auth.route.js";
import { likeRouter } from "./router/like.route.js";
import { messageRouter } from "./router/message.route.js";
import { userRouter } from "./router/user.route.js";

const app = express();

// Configurar helmet com permissões para imagens
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);

// CORS configuration based on environment
const corsOrigin = env.NODE_ENV === "production" 
  ? [getFrontendUrl()] // Only allow specific frontend URL in production
  : "*"; // Allow all origins in development

app.use(
  cors({
    origin: corsOrigin,
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(import.meta.dirname, "../uploads"))
);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/likes", likeRouter);
app.use("/matches", messageRouter);

app.listen(env.PORT, () => {
  console.log(`🚀 Server is running on port ${env.PORT}`);
  console.log(`📍 Environment: ${env.NODE_ENV}`);
  console.log(`🔒 CORS Origin: ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`);
  console.log(`🌐 Frontend URL: ${getFrontendUrl()}`);
});
