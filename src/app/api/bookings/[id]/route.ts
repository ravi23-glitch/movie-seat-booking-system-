import { NextRequest } from "next/server";
import { bookingController } from "@/controllers/booking.controller";
import { logRequest } from "@/middlewares/logger.middleware";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const logger = logRequest(req, `GET /api/bookings/${params.id}`);
  const res = await bookingController.getBookingById(req, { params });
  logger.end(res.status);
  return res;
}
