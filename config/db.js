const mongoose = require("mongoose");

// MONGODB INITIALIZATION AND SCHEMA
  const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_ATLAS_URI);
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // stop the app if DB connection fails
  }
};

// mongoose
//   .connect(process.env.MONGO_LOCAL_URI)
//   .then(() => console.log("Connected to MongoDB Atlas"))
//   .catch((err) => console.error("Error connecting to MongoDB:", err));

module.exports = connectDB;