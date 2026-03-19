import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import mongoose from "mongoose";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

async function connectDB() {
  const MONGO_URI = process.env["MONGODB_URI"];
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI);
    logger.info("Connected to MongoDB (external)");
  } else {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    logger.info({ uri }, "Connected to MongoDB (in-memory)");
    await seedData();
  }
}

async function seedData() {
  const { Course } = await import("./models/Course.js");
  const count = await Course.countDocuments();
  if (count > 0) return;

  await Course.insertMany([
    {
      title: "JavaScript for Beginners",
      description: "Learn JavaScript from scratch. Cover variables, functions, DOM manipulation, and build real projects.",
      price: 299,
      content: "Module 1: Variables & Data Types\nModule 2: Functions & Scope\nModule 3: Arrays & Objects\nModule 4: DOM Manipulation\nModule 5: Async JavaScript\n\nProject: Build a Todo App\n\nResources:\n- Video: https://example.com/js-course\n- PDF Notes: https://example.com/js-notes.pdf",
      thumbnailUrl: "/images/hero-bg.png",
    },
    {
      title: "React.js Fundamentals",
      description: "Master React.js — components, state, hooks, and building modern web applications.",
      price: 399,
      content: "Module 1: React Basics & JSX\nModule 2: Components & Props\nModule 3: State & useState Hook\nModule 4: useEffect & Side Effects\nModule 5: React Router\nModule 6: API Integration\n\nProject: Build a Movie App\n\nResources:\n- Video: https://example.com/react-course\n- PDF Notes: https://example.com/react-notes.pdf",
      thumbnailUrl: "/images/hero-bg.png",
    },
    {
      title: "Node.js & Express Backend",
      description: "Build robust REST APIs with Node.js, Express, and MongoDB. Learn authentication, middleware, and deployment.",
      price: 449,
      content: "Module 1: Node.js Fundamentals\nModule 2: Express Framework\nModule 3: REST API Design\nModule 4: MongoDB & Mongoose\nModule 5: JWT Authentication\nModule 6: Deployment\n\nProject: Build a Blog API\n\nResources:\n- Video: https://example.com/node-course\n- PDF Notes: https://example.com/node-notes.pdf",
      thumbnailUrl: "/images/hero-bg.png",
    },
    {
      title: "Python Data Science",
      description: "Analyze data with Python, Pandas, NumPy, and Matplotlib. Build data visualizations and ML models.",
      price: 349,
      content: "Module 1: Python Basics\nModule 2: Pandas & DataFrames\nModule 3: NumPy\nModule 4: Data Visualization with Matplotlib\nModule 5: Machine Learning Intro (Scikit-learn)\n\nProject: Analyze a Real Dataset\n\nResources:\n- Video: https://example.com/python-course\n- PDF Notes: https://example.com/python-notes.pdf",
      thumbnailUrl: "/images/hero-bg.png",
    },
    {
      title: "UI/UX Design Essentials",
      description: "Design beautiful, user-friendly interfaces. Learn Figma, design principles, and prototyping.",
      price: 249,
      content: "Module 1: Design Principles\nModule 2: Color Theory & Typography\nModule 3: Figma Basics\nModule 4: Wireframing & Prototyping\nModule 5: User Research\n\nProject: Design a Mobile App UI\n\nResources:\n- Video: https://example.com/ux-course\n- PDF Notes: https://example.com/ux-notes.pdf",
      thumbnailUrl: "/images/hero-bg.png",
    },
  ]);
  logger.info("Sample courses seeded");
}

connectDB().catch((err) => logger.error({ err }, "MongoDB connection error"));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
