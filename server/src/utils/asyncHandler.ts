import { Request, Response, NextFunction } from "express";

interface AsyncHandlerProps {
  requestHandler: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<void>;
}

const asyncHandler = ({ requestHandler }: AsyncHandlerProps) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};

export { asyncHandler };
