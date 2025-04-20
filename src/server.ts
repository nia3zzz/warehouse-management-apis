import express, { Request, Response } from "express";
import "dotenv/config";
import { DBConn } from "./utils/DBConn";
import userRoutes from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/errorHandler";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import saleRoutes from "./routes/saleRoutes";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Warehouse APIs are running.");
});

app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/product", productRoutes);
app.use("/sale", saleRoutes);

app.use("*", (req: Request, res: Response) => {
  res.status(404).send("Page not found");
});

app.use(errorHandler);

app.listen(port, async () => {
  await DBConn();
  console.log(`Warehouse APIs are running at http://localhost:${port}`);
});
