import mongoose from "mongoose";

const DBConn = async () => {
  const mongoURI: string = process.env.MONGO_URI || "";

  if (!mongoURI) {
    throw new Error("Mongo URI is missing in .env file");
  }
  try {
    const dbConnClient = await mongoose.connect(mongoURI);

    console.log("Connected to database, host:", dbConnClient.connection.host);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export { DBConn };
