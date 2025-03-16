import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface customExpressRequest extends Request {
  userId?: string;
}

interface decodedTokenResult extends JwtPayload {
  id: string;
}

const authHandler = async (
  req: customExpressRequest,
  res: Response,
  next: NextFunction
) => {
  const token: string = await req.cookies.token;

  if (!token) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as decodedTokenResult;

    req.userId = decodedToken.id;
    return next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }
};

export default authHandler;
