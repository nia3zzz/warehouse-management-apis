import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};

export default errorHandler;
