import "dotenv/config";
import mongoose from "mongoose";
import { Enrollment } from "../src/models/Enrollment.js";

// Transaction IDs to delete (old/unknown courses)
const TRANSACTION_IDS = [
  "QR99173EB77BF8",
  "QR7C1C3B80AD37",
  "QRED42468E4873",
  "QR86406C33554D",
];

async function main() {
  const uri = process.env["MONGODB_URI"];
  if (!uri) {
    throw new Error("MONGODB_URI is required in env to run cleanup.");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const result = await Enrollment.deleteMany({
    transactionId: { $in: TRANSACTION_IDS },
  });

  console.log(
    `Removed ${result.deletedCount ?? 0} enrollment(s) with transactionIds:`,
    TRANSACTION_IDS.join(", "),
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
