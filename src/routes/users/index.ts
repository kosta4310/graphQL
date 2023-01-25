import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from "./schemas";
import type { UserEntity } from "../../utils/DB/entities/DBUsers";
import { HttpError } from "@fastify/sensible/lib/httpError";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<UserEntity[]> {
    return await fastify.db.users.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      // const reg = /^[a-z0-9]{8}-([a-z0-9]{4}-){3}[a-z0-9]{12}$/;
      const userId = request.params.id;

      // if (!userId.match(reg)) {
      //   return fastify.httpErrors.badRequest();
      // }

      const res = await fastify.db.users.findOne({
        key: "id",
        equals: userId,
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
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const userId = request.params.id;
      const user = await fastify.db.users.findOne({
        key: "id",
        equals: userId,
      });

      if (!user) {
        return fastify.httpErrors.badRequest();
      }

      const userSubscribedTo = await fastify.db.users.findMany({
        key: "subscribedToUserIds",
        inArray: userId,
      });

      userSubscribedTo.forEach(async (user) => {
        const arr = user.subscribedToUserIds;
        const newArray = arr.filter((id) => id !== userId);
        await fastify.db.users.change(user.id, {
          subscribedToUserIds: newArray,
        });
      });

      return await fastify.db.users.delete(userId);
    }
  );

  fastify.post(
    "/:id/subscribeTo",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const u1Id: string = request.params.id;
      const u2Id: string = request.body.userId;

      const u1 = await fastify.db.users.findOne({ key: "id", equals: u1Id });
      if (!u1) {
        return fastify.httpErrors.badRequest();
      }

      const u2 = await fastify.db.users.findOne({ key: "id", equals: u2Id });
      if (!u2) {
        return fastify.httpErrors.badRequest();
      }

      let arr = u2.subscribedToUserIds;
      arr.push(u1Id);

      return await fastify.db.users.change(u2Id, {
        subscribedToUserIds: arr,
      });
    }
  );

  fastify.post(
    "/:id/unsubscribeFrom",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const u1Id: string = request.params.id;
      const u2Id: string = request.body.userId;

      const u1 = await fastify.db.users.findOne({ key: "id", equals: u1Id });
      if (!u1) {
        return fastify.httpErrors.badRequest();
      }

      const u2 = await fastify.db.users.findOne({ key: "id", equals: u2Id });
      if (!u2) {
        return fastify.httpErrors.badRequest();
      }

      let arr = u2.subscribedToUserIds;
      const lengthBefore = arr.length;
      const resArray = arr.filter((id) => id !== u1Id);
      const lengthAfter = resArray.length;

      if (lengthAfter === lengthBefore) {
        return fastify.httpErrors.badRequest();
      }

      return await fastify.db.users.change(u2Id, {
        subscribedToUserIds: resArray,
      });
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity | HttpError> {
      const user = await fastify.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });

      if (!user) {
        return fastify.httpErrors.badRequest();
      }
      return await fastify.db.users.change(request.params.id, request.body);
    }
  );
};

export default plugin;
