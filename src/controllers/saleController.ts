import { Request, Response } from "express";
import { customExpressRequest } from "../middlewares/authHandler";
import {
  createSaleZod,
  getSalesDataZod,
  updateSaleOrderStatusZod,
  updateSaleZod,
} from "../DTO/saleZodValidator";
import { Product } from "../models/productModel";
import { SaleOrderItem } from "../models/saleOrderItemModel";
import { SaleOrder } from "../models/saleOrderModel";
import { User } from "../models/userModel";
import logger from "../utils/logger";
import { getCategoryZod } from "../DTO/categoryZodValidator";
import { Category } from "../models/categoryModel";

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

const getSale = async (req: Request, res: Response): Promise<any> => {
  //req param validation
  const { id } = req.params;

  //using a category module's validator as it suits the need perfectly providing an object id field
  const validateData = getCategoryZod.safeParse({
    id,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }
  try {
    //check if order exists
    const foundOrder = await SaleOrder.findById(validateData.data.id);

    if (!foundOrder) {
      return res.status(404).json({
        status: "error",
        message: "No order found with this id.",
      });
    }

    //get sale order item
    const foundSaleOrderItem = await SaleOrderItem.findOne({
      salesOrderId: foundOrder._id,
    });

    if (!foundSaleOrderItem) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //get product data
    const foundProduct = await Product.findOne({
      _id: foundSaleOrderItem.productId,
    });

    if (!foundProduct) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //get category of product
    const foundCategory = await Category.findById(foundProduct.categoryId);

    if (!foundCategory) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //get the customer
    const foundCustomer = await User.findById(foundOrder.customerId);

    if (!foundCustomer) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //return the repsonse
    return res.status(200).json({
      status: "success",
      message: "Sale data has been fetched.",
      data: {
        orderId: foundOrder._id,
        productId: foundProduct._id,
        productName: foundProduct.name,
        categoryId: foundCategory._id,
        categoryName: foundCategory.name,
        orderedQuantity: foundSaleOrderItem.quantity,
        orderedPrice: foundSaleOrderItem.totalPrice,
        orderStatus: foundOrder.status,
        remainingQuantity: foundProduct.quantity,
        productPrice: foundProduct.price,
        customerId: foundCustomer._id,
        customerName: foundCustomer.name,
        phoneNumber: foundCustomer.phoneNumber,
        address: foundCustomer.address,
        createdAt: foundOrder.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const updateSale = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req param validation
  const { id } = req.params;
  const { quantity } = req.body;

  //using a category module's validator as it suits the need perfectly providing an object id field
  const validateData = updateSaleZod.safeParse({
    id,
    quantity,
  });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check if the order exists
    const foundSaleOrder = await SaleOrder.findById(validateData.data.id);

    if (!foundSaleOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found with this id.",
      });
    }

    //retrieve sales order item
    const foundSaleOrderItem = await SaleOrderItem.findOne({
      salesOrderId: foundSaleOrder._id,
    });

    if (!foundSaleOrderItem) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //retrieve the product object
    const foundProduct = await Product.findById(foundSaleOrderItem.productId);

    if (!foundProduct) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //check if the values are unchanged
    if (validateData.data.quantity === foundSaleOrderItem.quantity) {
      return res.status(409).json({
        status: "error",
        message: "No changes found to update the order.",
      });
    }

    if (validateData.data.quantity > foundProduct.quantity) {
      return res.status(409).json({
        status: "error",
        message: `Only ${foundProduct.quantity} products are left in stock.`,
      });
    }

    //update the price and quantity
    const newPrice = validateData.data.quantity * foundProduct.price;

    await SaleOrderItem.findByIdAndUpdate(foundSaleOrderItem._id, {
      quantity: validateData.data.quantity,
      totalPrice: newPrice,
    });

    // update the product's stock
    const quantityDifference =
      foundSaleOrderItem.quantity - validateData.data.quantity;

    await Product.findByIdAndUpdate(foundProduct._id, {
      quantity: foundProduct.quantity + quantityDifference,
    });

    await logger(
      req.userId as string,
      "updateSale",
      `An admin of id ${req.userId} has updated an order of id ${foundSaleOrder._id}`
    );

    return res.status(200).json({
      status: "success",
      message: "Order has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const deleteSale = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req param validation
  const { id } = req.params;

  const validateData = getCategoryZod.safeParse({ id });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check if order exists
    const foundOrder = await SaleOrder.findById(validateData.data.id);

    if (!foundOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    //get the sale order item document
    const foundSaleOrderItem = await SaleOrderItem.findOne({
      salesOrderId: foundOrder._id,
    });

    if (!foundSaleOrderItem) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong.",
      });
    }

    //update the product stock if not delivered
    if (foundOrder.status !== "Order Delivered") {
      await Product.findByIdAndUpdate(foundSaleOrderItem.productId, {
        $inc: { quantity: foundSaleOrderItem.quantity },
      });

      await SaleOrder.findByIdAndDelete(foundOrder._id);
      await SaleOrderItem.findByIdAndDelete(foundSaleOrderItem._id);

      await logger(
        req.userId as string,
        "deleteSale",
        `An admin of id ${req.userId} has deleted an order of id ${foundOrder._id}`
      );

      return res.status(200).json({
        status: "success",
        mesage: "Order has been deleted.",
      });
    }
    //if already deleved just delete the orders

    await SaleOrder.findByIdAndDelete(foundOrder._id);
    await SaleOrderItem.findByIdAndDelete(foundSaleOrderItem._id);

    await logger(
      req.userId as string,
      "deleteSale",
      `An admin of id ${req.userId} has deleted an order of id ${foundOrder._id}`
    );

    return res.status(200).json({
      status: "success",
      mesage: "Order has been deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

const updateSaleOrderStatus = async (
  req: customExpressRequest,
  res: Response
): Promise<any> => {
  //req param validation
  const { id } = req.params;

  const validateData = updateSaleOrderStatusZod.safeParse({ id });

  if (!validateData.success) {
    return res.status(400).json({
      status: "error",
      message: validateData.error.errors[0].message,
    });
  }

  try {
    //check if the order exists
    const foundSaleOrder = await SaleOrder.findById(validateData.data.id);

    if (!foundSaleOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    //update according to pre set values if none set delivered
    if (foundSaleOrder.status === "Order Placed") {
      await SaleOrder.findByIdAndUpdate(foundSaleOrder._id, {
        status: "Order Delivered",
      });

      return res.status(200).json({
        status: "success",
        message: "Order has been updated.",
      });
    }

    //if set delivered set as order placed
    await SaleOrder.findByIdAndUpdate(foundSaleOrder._id, {
      status: "Order Placed",
    });

    return res.status(200).json({
      status: "success",
      message: "Order has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error.",
    });
  }
};

export {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
  updateSaleOrderStatus,
};
