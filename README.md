Project Overview

This is the backend service for a Flipkart clone, built using Node.js, Express.js, and MongoDB. The backend provides essential functionalities such as user authentication (OTP-based login), product management, cart management, and order handling. The API is documented using Swagger.

📌 Features

User Authentication

OTP-based login system

JWT token generation for authentication

Cart Management

Add items to the cart

Remove items from the cart

Update item quantity

Empty the cart

Fetch user’s cart

Order Management (Future Scope)

Swagger API Documentation

Secure Routes using Middleware

🏗 Tech Stack

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT, OTP-based authentication

API Documentation: Swagger

Mail Service: Nodemailer (for OTP emails)

🔧 Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/Nitish814112/Flip.git
cd Flip

2️⃣ Install Dependencies

npm install

3️⃣ Configure Environment Variables

Create a .env file in the root directory and add the following variables:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

4️⃣ Start the Server

npm start

The server will start at http://localhost:5000

🔹 API Endpoints

🏷️ User Authentication

🔹 Send OTP

POST /api/login

🔹 Verify OTP

POST /api/verify-otp

🔹 Logout

POST /api/logout

🛒 Cart Management

🔹 Fetch Cart

GET /api/cart

🔹 Add to Cart

POST /api/cart/add

🔹 Remove from Cart

DELETE /api/cart/remove/:id

🔹 Update Cart Quantity

PATCH /api/cart/update/:id

🔹 Empty Cart

DELETE /api/cart/empty

📜 API Documentation

Swagger documentation is available at:

http://localhost:5000/api-docs

Ensure that the Swagger setup is correctly defined in setupSwagger(app) in your server.js file.

🤝 Contributing

Feel free to fork this repo and submit a pull request. Contributions are welcome!

📜 License

This project is open-source and available under the MIT License.

💡 Happy Coding! 🚀