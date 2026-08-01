import { FastifyRequest, FastifyReply } from "fastify";
import SearchModel from "../models/search.model";

class SearchController {
  async globalSearch(req: FastifyRequest, reply: FastifyReply) {
    try {
      const q = (req.query as any).q as string;
      const lang = ((req.query as any).lang as string) || "vi";

      if (!q) {
        return reply.status(400).send({
          status: 400,
          message: "Query parameter 'q' is required",
        });
      }

      const result = await SearchModel.globalSearch(q, lang);

      return reply.status(200).send({
        status: 200,
        message: "Search completed successfully",
        data: result.rows,
      });
    } catch (error: any) {
      console.error("Global search error:", error);
      return reply.status(500).send({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

export default new SearchController();

