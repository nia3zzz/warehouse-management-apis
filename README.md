# Warehouse Management APIs

A TypeScript-based RESTful API system for managing warehouse operations—including inventory, orders, and product tracking. Built with Node.js and Express, this backend is designed for scalability and modularity, making it ideal for warehouse automation and inventory control systems.

## 🚀 Features

- CRUD operations for products, warehouses, and inventory
- Order management with status tracking
- Authentication and role-based access control
- Environment-based configuration via `.env` files
- TypeScript for improved type safety and maintainability
- Modular folder structure for scalability

## 📁 Project Structure

```
warehouse-management-apis/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   └── index.ts
├── .env.sample
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

```bash
git clone https://github.com/nia3zzz/warehouse-management-apis.git
cd warehouse-management-apis
npm install
```

### Environment Configuration

Create a `.env` file in the root directory based on `.env.sample`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/warehouse_db
JWT_SECRET=your_jwt_secret
```

### Running the Server

```bash
npm run dev  # For development with nodemon
# or
npm start     # For production
```

### Running the Server Using Docker

```bash
docker build -t warehouse-management-apis:latest . #Build the image first
docker run -p 8080:8080 warehouse-management-apis #This will create a container and run it
```

## 🛠️ Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Nodemailer

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

System Design = https://app.eraser.io/workspace/Q6zZLd4n61ETeCIyLwkq?origin=share

API Documentation = https://documenter.getpostman.com/view/32203863/2sB2j7epud
