const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Note: useNewUrlParser and useUnifiedTopology are deprecated in newer mongoose versions, 
    // but often kept for compatibility. Using basic connect is sufficient for Mongoose 6+.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
