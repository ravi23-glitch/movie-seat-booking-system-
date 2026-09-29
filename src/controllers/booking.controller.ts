import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/services/booking.service";
import { lockSeatsSchema, confirmBookingSchema } from "@/validators";
import { getAuthUser } from "@/middlewares/auth.middleware";
import { handleError } from "@/middlewares/error.middleware";
import { BookingStatus } from "@/types";

export class BookingController {
  async lockSeats(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const body = await req.json();
      const validated = lockSeatsSchema.parse(body);

      const result = await bookingService.lockSeats(
        validated.showId,
        validated.seatIds,
        user.userId
      );

      return NextResponse.json({
        success: true,
        message: "Seats temporarily locked for 10 minutes",
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async confirmBooking(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const body = await req.json();
      const validated = confirmBookingSchema.parse(body);

      const result = await bookingService.confirmBooking({
        reservationToken: validated.reservationToken,
        userId: user.userId,
        paymentMethod: validated.paymentMethod,
        idempotencyKey: validated.idempotencyKey,
        customerName: validated.customerName,
        snacks: validated.snacks,
      });

      return NextResponse.json({
        success: true,
        message: "Booking confirmed successfully",
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async cancelBooking(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const user = getAuthUser(req);
      const result = await bookingService.cancelBooking(params.id, user.userId);

      return NextResponse.json({
        success: true,
        message: "Booking cancelled and seats released",
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async getMyBookings(req: NextRequest) {
    try {
      const user = getAuthUser(req);
      const statusParam = req.nextUrl.searchParams.get("status") as BookingStatus | null;
      const bookings = await bookingService.getUserBookings(
        user.userId,
        statusParam || undefined
      );

      return NextResponse.json({
        success: true,
        data: bookings,
      });
    } catch (err) {
      return handleError(err);
    }
  }

  async getBookingById(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const user = getAuthUser(req);
      const booking = await bookingService.getBookingById(params.id);

      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        );
      }

      if (booking.userId !== user.userId && user.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Forbidden: Not your booking" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: booking,
      });
    } catch (err) {
      return handleError(err);
    }
  }
}

export const bookingController = new BookingController();
