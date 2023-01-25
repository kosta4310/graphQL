import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createPostBodySchema, changePostBodySchema } from "./schema";
import type { PostEntity } from "../../utils/DB/entities/DBPosts";
import { HttpError } from "@fastify/sensible/lib/httpError";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<PostEntity[]> {
    return await fastify.db.posts.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const res = await fastify.db.posts.findOne({
        key: "id",
        equals: request.params.id,
      });

      if (!res) {
        return fastify.httpErrors.notFound();
      }
      return res;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const user = await fastify.db.users.findOne({
        key: "id",
        equals: request.body.userId,
      });

      if (!user) {
        return fastify.httpErrors.badRequest();
      }
      return await fastify.db.posts.create(request.body);
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const post = await fastify.db.posts.findOne({
        key: "id",
        equals: request.params.id,
      });

      if (!post) {
        return fastify.httpErrors.badRequest();
      }
      return await fastify.db.posts.delete(request.params.id);
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity | HttpError> {
      const post = await fastify.db.posts.findOne({
        key: "id",
        equals: request.params.id,
      });

      if (!post) {
        return fastify.httpErrors.badRequest();
      }

      return await fastify.db.posts.change(request.params.id, request.body);
    }
  );
};

export default plugin;
