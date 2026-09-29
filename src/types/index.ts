export type Role = "USER" | "ADMIN";
export type SeatType = "REGULAR" | "PREMIUM";
export type ShowSeatStatus = "AVAILABLE" | "LOCKED" | "BOOKED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type PaymentStatus = "SUCCESS" | "FAILED" | "REFUNDED";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface MovieDto {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  durationMin: number;
  rating: number;
  genre: string;
  releaseDate: Date;
}

export interface TheatreDto {
  id: string;
  name: string;
  location: string;
  city: string;
}

export interface ScreenDto {
  id: string;
  theatreId: string;
  screenNumber: number;
  totalSeats: number;
}

export interface SeatDto {
  id: string;
  screenId: string;
  seatRow: string;
  seatNumber: number;
  seatType: SeatType;
  basePrice: number;
}

export interface ShowDto {
  id: string;
  movieId: string;
  screenId: string;
  startTime: Date;
  endTime: Date;
  priceMultiplier: number;
  movie?: MovieDto;
  screen?: ScreenDto & { theatre?: TheatreDto };
}

export interface ShowSeatDto {
  id: string;
  showId: string;
  seatId: string;
  status: ShowSeatStatus;
  lockedUntil: Date | null;
  lockedByUserId: string | null;
  version: number;
  seat: SeatDto;
  price: number;
}

export interface BookingDto {
  id: string;
  userId: string;
  customerName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  showId: string;
  totalAmount: number;
  status: BookingStatus;
  bookingReference: string;
  createdAt: Date;
  updatedAt: Date;
  show?: ShowDto;
  bookingSeats?: {
    id: string;
    seatId: string;
    price: number;
    seat: SeatDto;
  }[];
  snacks?: {
    id?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  payment?: {
    id: string;
    amount: number;
    status: PaymentStatus;
    transactionRef: string;
    paymentMethod?: string;
  } | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}
