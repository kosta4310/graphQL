import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { changeMemberTypeBodySchema } from "./schema";
import type { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";
import { HttpError } from "@fastify/sensible/lib/httpError";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    return await fastify.db.memberTypes.findMany();
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | HttpError> {
      const res = await fastify.db.memberTypes.findOne({
        key: "id",
        equals: request.params.id,
      });

      if (!res) {
        return fastify.httpErrors.notFound();
      }

      return res;
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity | HttpError> {
      const memberTypesId = request.params.id;
      const res = await fastify.db.memberTypes.findOne({
        key: "id",
        equals: memberTypesId,
      });

      if (!res) {
        return fastify.httpErrors.badRequest();
      }

      return await fastify.db.memberTypes.change(memberTypesId, request.body);
    }
  );
};

export default plugin;
