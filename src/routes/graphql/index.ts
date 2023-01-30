import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import {
  user,
  users,
  posts,
  post,
  profile,
  memberType,
  profiles,
  memberTypes,
} from "./data/query";
import {
  createUser,
  createProfiles,
  createPost,
  updateUser,
  updateProfiles,
  updatePost,
  updateMemberTypes,
  subscribeTo,
  unsubscribeFrom,
} from "./data/mutation";
import { graphql, GraphQLObjectType, GraphQLSchema } from "graphql";
import { graphqlBodySchema } from "./schema";

const Query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    users,
    user,
    posts,
    post,
    profile,
    profiles,
    memberType,
    memberTypes,
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createUser,
    createProfiles,
    createPost,
    updateUser,
    updateProfiles,
    updatePost,
    updateMemberTypes,
    subscribeTo,
    unsubscribeFrom,
  }),
});

const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation,
});

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    "/",
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      return await graphql({
        schema,
        source: String(request.body.query),
        contextValue: { fastify, dataloaders: new WeakMap() },
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
