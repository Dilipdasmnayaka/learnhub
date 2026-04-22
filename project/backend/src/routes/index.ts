import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import coursesRouter from "./courses.js";
import enrollmentsRouter from "./enrollments.js";
import usersRouter from "./users.js";
import chatbotRouter from "./chatbot.js";
import paymentsRouter from "./payments.js";
import adminNotificationsRouter from "./adminNotifications.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/courses", coursesRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/users", usersRouter);
router.use("/chatbot", chatbotRouter);
router.use("/payments", paymentsRouter);
router.use("/admin/notifications", adminNotificationsRouter);

export default router;
