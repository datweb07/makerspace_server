const fs = require('fs');
const path = require('path');

const generateModule = (entityName, tableName) => {
  const isEvent = entityName === 'events';
  
  const capEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  const singleEntityName = entityName.endsWith('s') ? entityName.slice(0, -1) : entityName;
  const singleCapEntity = singleEntityName.charAt(0).toUpperCase() + singleEntityName.slice(1);

  const eventTimeFieldSchema = isEvent ? `\n  event_time: z.string().or(z.date()).optional().nullable(),` : '';
  const eventTimeType = isEvent ? `\n  event_time?: string | Date | null;` : '';
  const eventTimeInsert1 = isEvent ? `, event_time` : '';
  const eventTimeInsert2 = isEvent ? `, $10` : '';
  const eventTimeInsert3 = isEvent ? `,\n        data.event_time || null` : '';

  const controllerContent = `import { FastifyRequest, FastifyReply } from "fastify";
import ${entityName}Model from "../models/${entityName}.model";
import { Create${capEntity}Type, Update${capEntity}Type } from "../schemaValidation/${entityName}.schema";
import { formatImageUrl } from "../utils/formatImageUrl";

export const get${capEntity}List = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await ${entityName}Model.getAll(req.lang);
    const formattedData = result.rows.map(item => ({
      ...item,
      cover_image: formatImageUrl(item.cover_image)
    }));
    reply.send({ data: formattedData });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const get${capEntity}ById = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await ${entityName}Model.getById(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ data: item });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const create${capEntity} = async (
  req: FastifyRequest<{ Body: Create${capEntity}Type }>,
  reply: FastifyReply
) => {
  try {
    const result = await ${entityName}Model.insert(req.body, req.lang);
    const item = result.rows[0];
    item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ message: "Created successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const update${capEntity} = async (
  req: FastifyRequest<{ Params: { id: string }; Body: Update${capEntity}Type }>,
  reply: FastifyReply
) => {
  try {
    const result = await ${entityName}Model.update(req.params.id, req.body, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    const item = result.rows[0];
    item.cover_image = formatImageUrl(item.cover_image);
    reply.send({ message: "Updated successfully", data: item });
  } catch (error: any) {
    console.error(error);
    if (error.code === "23505") {
      return reply.status(400).send({ message: "Slug already exists" });
    }
    reply.status(500).send({ message: "Internal Server Error" });
  }
};

export const delete${capEntity} = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const result = await ${entityName}Model.delete(req.params.id, req.lang);
    if (result.rows.length === 0) {
      return reply.status(404).send({ message: "Not found" });
    }
    reply.send({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
`;

  const routeContent = `import { FastifyInstance } from "fastify";
import {
  get${capEntity}List,
  get${capEntity}ById,
  create${capEntity},
  update${capEntity},
  delete${capEntity},
} from "../controllers/${entityName}.controller";
import { Create${capEntity}Body, Update${capEntity}Body } from "../schemaValidation/${entityName}.schema";

export default async function ${entityName}Routes(fastify: FastifyInstance) {
  fastify.get("/", get${capEntity}List);
  fastify.get("/:id", get${capEntity}ById);
  fastify.post(
    "/",
    {
      schema: {
        body: Create${capEntity}Body,
      },
    },
    create${capEntity}
  );
  fastify.put(
    "/:id",
    {
      schema: {
        body: Update${capEntity}Body,
      },
    },
    update${capEntity}
  );
  fastify.delete("/:id", delete${capEntity});
}
`;

  fs.writeFileSync(path.join(__dirname, `src/controllers/${entityName}.controller.ts`), controllerContent);
  fs.writeFileSync(path.join(__dirname, `src/routes/${entityName}.route.ts`), routeContent);
  console.log(`Generated ${entityName}`);
};

generateModule('news', 'posts.news');
generateModule('events', 'posts.events');
generateModule('projects', 'posts.featured_projects');

