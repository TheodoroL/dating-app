import cors from "cors";
import express from "express";
import { env } from "./libs/schema/env.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.listen(env.PORT, () => {
  console.log("Server is running on port 3000");
});
