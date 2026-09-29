import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/services/admin.service";
import { requireAdmin } from "@/middlewares/auth.middleware";
import { handleError } from "@/middlewares/error.middleware";
import {
  createMovieSchema,
  createShowSchema,
  createTheatreSchema,
  createScreenSchema,
} from "@/validators";

export class AdminController {
  async getMetrics(req: NextRequest) {
    try {
      requireAdmin(req);
      const metrics = await adminService.getDashboardMetrics();
      return NextResponse.json({ success: true, data: metrics });
    } catch (err) {
      return handleError(err);
    }
  }

  // Movies
  async createMovie(req: NextRequest) {
    try {
      requireAdmin(req);
      const body = await req.json();
      const validated = createMovieSchema.parse(body);
      const movie = await adminService.createMovie({
        ...validated,
        releaseDate: new Date(validated.releaseDate),
      });
      return NextResponse.json({ success: true, data: movie }, { status: 201 });
    } catch (err) {
      return handleError(err);
    }
  }

  async updateMovie(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      requireAdmin(req);
      const body = await req.json();
      const movie = await adminService.updateMovie(params.id, body);
      return NextResponse.json({ success: true, data: movie });
    } catch (err) {
      return handleError(err);
    }
  }

  async deleteMovie(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      requireAdmin(req);
      await adminService.deleteMovie(params.id);
      return NextResponse.json({ success: true, message: "Movie deleted" });
    } catch (err) {
      return handleError(err);
    }
  }

  // Theatres
  async getTheatres(req: NextRequest) {
    try {
      requireAdmin(req);
      const theatres = await adminService.getTheatres();
      return NextResponse.json({ success: true, data: theatres });
    } catch (err) {
      return handleError(err);
    }
  }

  async createTheatre(req: NextRequest) {
    try {
      requireAdmin(req);
      const body = await req.json();
      const validated = createTheatreSchema.parse(body);
      const theatre = await adminService.createTheatre(validated);
      return NextResponse.json({ success: true, data: theatre }, { status: 201 });
    } catch (err) {
      return handleError(err);
    }
  }

  async deleteTheatre(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      requireAdmin(req);
      await adminService.deleteTheatre(params.id);
      return NextResponse.json({ success: true, message: "Theatre deleted" });
    } catch (err) {
      return handleError(err);
    }
  }

  // Screens
  async createScreen(req: NextRequest) {
    try {
      requireAdmin(req);
      const body = await req.json();
      const validated = createScreenSchema.parse(body);
      const screen = await adminService.createScreen(validated);
      return NextResponse.json({ success: true, data: screen }, { status: 201 });
    } catch (err) {
      return handleError(err);
    }
  }

  // Shows
  async getShows(req: NextRequest) {
    try {
      requireAdmin(req);
      const shows = await adminService.getShows();
      return NextResponse.json({ success: true, data: shows });
    } catch (err) {
      return handleError(err);
    }
  }

  async createShow(req: NextRequest) {
    try {
      requireAdmin(req);
      const body = await req.json();
      const validated = createShowSchema.parse(body);
      const show = await adminService.createShow({
        ...validated,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
      });
      return NextResponse.json({ success: true, data: show }, { status: 201 });
    } catch (err) {
      return handleError(err);
    }
  }

  async deleteShow(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      requireAdmin(req);
      await adminService.deleteShow(params.id);
      return NextResponse.json({ success: true, message: "Show deleted" });
    } catch (err) {
      return handleError(err);
    }
  }
}

export const adminController = new AdminController();
