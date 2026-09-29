import { NextRequest, NextResponse } from "next/server";
import { showService } from "@/services/show.service";
import { handleError } from "@/middlewares/error.middleware";

export class ShowController {
  async getShowSeats(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const result = await showService.getShowSeats(params.id);
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (err) {
      return handleError(err);
    }
  }
}

export const showController = new ShowController();
