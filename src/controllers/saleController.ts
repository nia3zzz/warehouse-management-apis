import { Request, Response } from "express";
import { customExpressRequest } from "../middlewares/authHandler";
import { createSaleZod, getSalesDataZod } from "../DTO/saleZodValidator";
import { Product } from "../models/productModel";
import { SaleOrderItem } from "../models/saleOrderItemModel";
import { SaleOrder } from "../models/saleOrderModel";
import { User } from "../models/userModel";
import logger from "../utils/logger";

//create sale

const createSale = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req data validaton using zod
  const { customerId, productId, quantity } = req.body;

  const validateData = createSaleZod.safeParse({
    customerId,
    productId,
    quantity,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check product exists and is in stock
    const foundProduct = await Product.findById(validateData.data.productId);

    if (!foundProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found with this id.",
      });
    }

    if (validateData.data.quantity > foundProduct.quantity) {
      return res.status(409).json({
        status: "error",
        message: "Not enough product in stock.",
      });
    }

    //check customer exists
    const foundCustomer = await User.findOne({
      _id: validateData.data.customerId,
      role: "customer",
    });

    if (!foundCustomer) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found with this id.",
      });
    }

    const price = foundProduct.price * validateData.data.quantity;

    //create a sale document

    const salesOrderDocument = await SaleOrder.create({
      customerId: validateData.data.customerId,
      status: "Order Placed",
    });

    await SaleOrderItem.create({
      salesOrderId: salesOrderDocument._id,
      productId: foundProduct._id,
      quantity: foundProduct.quantity,
      totalPrice: price,
    });

    await Product.findOneAndUpdate(foundProduct._id, {
      $inc: {
        quantity: -validateData.data.quantity,
      },
    });

    await logger(
      req.userId as string,
      "createSale",
      `An admin of id ${req.userId} has created a order of id ${salesOrderDocument._id}`
    );

    return res.status(200).json({
      status: "success",
      message: "Order has been created.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const getSales = async (req: Request, res: Response): Promise<any> => {
  //req querys validation
  const { limit, offSet, productId, sortByPrice } = req.query;

  const validateData = getSalesDataZod.safeParse({
    limit,
    offSet,
    productId,
    sortByPrice,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }
  try {
    //to load the product query
    const productQuery: any = {};
    if (validateData.data.productId) {
      productQuery.productId = validateData.data.productId;
    }

    //to load the sort query
    const sortQuery: any = {};
    if (validateData.data.sortByPrice === "true") {
      sortQuery.price = validateData.data.sortByPrice === "true" ? 1 : -1;
    }

    //fetch the sales order items data using querys if provided
    const foundSalesItems = await SaleOrderItem.find(productQuery)
      .sort(sortQuery)
      .limit(Number(validateData.data.limit) ?? 10)
      .skip(Number(validateData.data.offSet) ?? 0);

    //fetch other fields using the sale order items data
    const salesData = await Promise.all(
      foundSalesItems.map(async (foundSaleItem) => {
        const foundOrderDocument = await SaleOrder.findOne({
          _id: foundSaleItem.salesOrderId,
        });
        const foundProduct = await Product.findById(foundSaleItem?.productId);
        const foundCustomer = await User.findById(
          foundOrderDocument?.customerId
        );

        return {
          orderId: foundOrderDocument?._id,
          productId: foundProduct?._id,
          productName: foundProduct?.name,
          customerId: foundCustomer?._id,
          customerName: foundCustomer?.name,
          quantity: foundSaleItem?.quantity,
          totalPrice: foundSaleItem?.totalPrice,
          createdAt: foundSaleItem?.createdAt,
        };
      })
    );

    return res.status(200).json({
      status: "success",
      message: "Fatched sales data.",
      data: salesData,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export { createSale, getSales };
