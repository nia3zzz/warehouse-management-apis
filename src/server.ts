import express, { Request, Response } from "express";
import "dotenv/config";
import { DBConn } from "./utils/DBConn";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Warehouse APIs are running.");
});

app.use("/user", userRoutes);

app.listen(port, async () => {
  await DBConn();
  console.log(`Warehouse APIs are running at http://localhost:${port}`);
});
