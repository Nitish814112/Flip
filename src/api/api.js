
const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const authenticateUser =require('../middleware/middleware')
const transporter = require('../mail_service/mail')
const {getDB} = require('../ConnectToDb/connection')

const USER_COLLECTION = "users";
const COLLECTION_NAME = process.env.COLLECTION_NAME;;
  

  router.get("/data", async (req, res) => {
    try {
      let db= getDB();
      const data = await db.collection(COLLECTION_NAME).find().toArray();
     
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });
  
  // ✅ Login API (Send OTP)
  
  router.post("/login", async (req, res) => {
  
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
  
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    console.log("🔹 Generated OTP:", otp);
  
    try {
      let db= getDB();
      await db.collection(USER_COLLECTION).updateOne(
        { email },
        { $set: { otp } },
        { upsert: true }
      );
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
      });
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error("❌ Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });
  
  // ✅ Verify OTP & Generate JWT Token
  router.post("/verify-otp", async (req, res) => {
    
    const { email, otp } = req.body;
    console.log("🔹 Received OTP:", otp);
  
    try {
      let db= getDB();
      const user = await db.collection(USER_COLLECTION).findOne({ email });
  
      if (!user || user.otp !== Number(otp)) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      // ✅ Generate JWT Token
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      // ✅ Clear OTP after verification
      await db.collection(USER_COLLECTION).updateOne({ email }, { $set: { otp: null } });
  
      res.json({ message: "OTP verified successfully", token });
    } catch (error) {
      console.error("❌ Error verifying OTP:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // ✅ Logout API
  router.post("/logout", authenticateUser, async (req, res) => {
    let db= getDB();
    await db.collection(USER_COLLECTION).updateOne({ email: req.user.email }, { $set: { isLoggedIn: false } });
    res.json({ message: "Logged out successfully" });
  });
  
  // ✅ Fetch User Cart
  router.get("/cart", authenticateUser, async (req, res) => {
    const user = await db.collection(USER_COLLECTION).findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.cart || []);
  });
  
  // ✅ Add to Cart API
  router.post("/cart/add", authenticateUser, async (req, res) => {
  
    try {
      let db= getDB();
      const { product } = req.body;
      if (!product || !product._id) {
        return res.status(400).json({ error: "Invalid product data" });
      }
  
      // Check if product already exists in the cart
      const user = await db.collection(USER_COLLECTION).findOne(
        { email: req.user.email, "cart._id": product._id } // 🔍 Check if product exists
      );
  
      if (user) {
        return res.status(400).json({ error: "You have the same product in your cart" });
      }
  
      // Add the product to the cart
      await db.collection(USER_COLLECTION).updateOne(
        { email: req.user.email },
        { $push: { cart: { ...product, quantity: 1 } } }
      );
  
      res.json({ message: "Product added to cart successfully" });
  
    } catch (error) {
      console.error("Error adding product to cart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  // ✅ Remove from Cart API
  
  
  router.delete("/cart/remove/:id", authenticateUser, async (req, res) => {
    try {
      let db= getDB();
      const { id } = req.params;
      console.log("Received Product ID:", id);
  
      // Fetch user's cart to debug stored _id format
      const user = await db.collection(USER_COLLECTION).findOne(
        { email: req.user.email },
        { projection: { cart: 1, _id: 0 } }
      );
      
      console.log("User's Cart from DB:", user?.cart); // 🔍 Debugging stored format
  
      // Try removing with both ObjectId and String ID formats
      const result = await db.collection(USER_COLLECTION).updateOne(
        { email: req.user.email },
        { $pull: { cart: { $or: [{ _id: new ObjectId(id) }, { _id: id }] } } } // 🔥 Match both formats
      );
  
      console.log("MongoDB Update Result:", result);
  
      if (result.modifiedCount === 0) {
        console.log("Product not found in cart for removal.");
        return res.status(404).json({ error: "Product not found in cart" });
      }
  
      // Fetch updated cart
      const updatedUser = await db.collection(USER_COLLECTION).findOne(
        { email: req.user.email },
        { projection: { cart: 1, _id: 0 } }
      );
  
      res.json({ message: "Product removed from cart", cart: updatedUser.cart });
  
      console.log("Updated successfully");
  
    } catch (error) {
      console.error("Error removing product from cart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  router.patch("/cart/update/:id", authenticateUser, async (req, res) => {
    try {
      let db= getDB();
      const { id } = req.params; // Product ID inside the cart
      const { quantity } = req.body;
      const email = req.user.email; // Get user email from authentication middleware
  
      console.log("🟢 Received update request for Product ID:", id, "New Quantity:", quantity);
  
      // ✅ Update the quantity of the specific product inside the cart array
      const result = await db.collection("users").updateOne(
        { email, "cart._id": id }, // 🔥 Find the user with the matching email and product _id in the cart
        { $set: { "cart.$.quantity": quantity } }
      );
  
      console.log("🟢 MongoDB Update Result:", result);
  
      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Product not found in cart" });
      }
  
      // ✅ Fetch the updated cart and return it to the frontend
      const updatedUser = await db.collection("users").findOne(
        { email },
        { projection: { cart: 1, _id: 0 } }
      );
  
      res.json({ message: "Quantity updated successfully", cart: updatedUser.cart });
  
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.delete("/cart/empty", authenticateUser, async (req, res) => {
    try {
      let db= getDB();
      await db.collection(USER_COLLECTION).updateOne(
        { email: req.user.email },
        { $set: { cart: [] } }
      );
      res.json({ message: "Cart emptied successfully" });
      console.log("empty");
      
    } catch (error) {
      console.error("Error emptying cart:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  module.exports =router;