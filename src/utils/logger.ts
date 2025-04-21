import { AuditLog } from "../models/auditLogModel";

type IAction =
  | "newAdminAdded"
  | "loginAdmin"
  | "logoutAdmin"
  | "removeAdmin"
  | "addSupplier"
  | "updateSupplier"
  | "deleteSupplier"
  | "createCategory"
  | "updateCategory"
  | "deleteCategory"
  | "addProduct"
  | "updateProduct"
  | "removeProduct"
  | "addCustomer"
  | "updateCustomer"
  | "deleteCustomer"
  | "createSale"
  | "updateSale"
  | "deleteSale";

const logger = async (
  userId: string,
  action: IAction,
  description: string
): Promise<void> => {
  try {
    const auditLogDocument = await AuditLog.create({
      userId,
      action,
      description,
    });

    console.log(
      `Time: ${auditLogDocument.createdAt}, Audit id: ${auditLogDocument._id}`
    );
  } catch (error) {
    throw error;
  }
};

export default logger;
