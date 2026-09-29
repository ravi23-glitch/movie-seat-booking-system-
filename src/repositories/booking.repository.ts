import { inMemoryDb } from "@/lib/store";
import { BookingDto, BookingStatus } from "@/types";

export class BookingRepository {
  async findByUserId(userId: string, status?: BookingStatus): Promise<BookingDto[]> {
    let bookings = Array.from(inMemoryDb.state.bookings.values()).filter(
      (b) => b.userId === userId
    );

    if (status) {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Attach user and customerName
    bookings = bookings.map((b) => {
      if (!b.user) {
        const u = inMemoryDb.state.users.get(b.userId);
        if (u) {
          b.user = { id: u.id, name: u.name, email: u.email };
          b.customerName = b.customerName || u.name;
        }
      }
      if (b.show && (!b.show.movie || !b.show.screen)) {
        const m = inMemoryDb.state.movies.get(b.show.movieId);
        const s = inMemoryDb.state.screens.get(b.show.screenId);
        const t = s ? inMemoryDb.state.theatres.get(s.theatreId) : undefined;
        b.show = {
          ...b.show,
          movie: m || b.show.movie,
          screen: s ? { ...s, theatre: t } : b.show.screen,
        };
      }
      return b;
    });

    // Sort by latest createdAt descending
    return bookings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async findById(id: string): Promise<BookingDto | null> {
    const booking = inMemoryDb.state.bookings.get(id);
    if (!booking) return null;

    if (!booking.user) {
      const u = inMemoryDb.state.users.get(booking.userId);
      if (u) {
        booking.user = { id: u.id, name: u.name, email: u.email };
        booking.customerName = booking.customerName || u.name;
      }
    }

    if (booking.show && (!booking.show.movie || !booking.show.screen)) {
      const m = inMemoryDb.state.movies.get(booking.show.movieId);
      const s = inMemoryDb.state.screens.get(booking.show.screenId);
      const t = s ? inMemoryDb.state.theatres.get(s.theatreId) : undefined;
      booking.show = {
        ...booking.show,
        movie: m || booking.show.movie,
        screen: s ? { ...s, theatre: t } : booking.show.screen,
      };
    }

    return booking;
  }

  async getAdminMetrics(): Promise<{
    totalTicketsSold: number;
    totalRevenue: number;
    activeShows: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
  }> {
    const bookings = Array.from(inMemoryDb.state.bookings.values());
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    const cancelled = bookings.filter((b) => b.status === "CANCELLED");

    const totalTicketsSold = confirmed.reduce(
      (sum, b) => sum + (b.bookingSeats?.length || 0),
      0
    );

    const totalRevenue = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);
    const activeShows = inMemoryDb.state.shows.size;

    return {
      totalTicketsSold,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      activeShows,
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelled.length,
    };
  }
}

export const bookingRepository = new BookingRepository();
