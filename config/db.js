
// mongodb://atlas-sql-66db0a3e7dd4f97c7747744d-nbb8m.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin
const mongoose = require('mongoose');

// Replace <username>, <password>, <cluster-url>, and <dbname> with your MongoDB details

// const uri = "mongodb+srv://ahfaz114:ahfaz114@cluster0.nbb8m.mongodb.net/sample_mflix?retryWrites=true&w=majority";
const uri = "mongodb+srv://ahfaz114:ahfaz114@cluster0.nbb8m.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0";

// Connecting to MongoDB using Mongoose
mongoose.connect(uri, {
    useNewUrlParser: true,     // Ensures mongoose uses the new MongoDB driver's connection string parser
    useUnifiedTopology: true,  // Enables the new unified topology engine in MongoDB driver
}).then(() => {
    console.log("Successfully connected to MongoDB via Mongoose");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});
