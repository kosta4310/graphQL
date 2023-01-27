// import { HttpError } from "@fastify/sensible/lib/httpError";
import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
// import { FastifyInstance } from "fastify";
// import { User } from "./data/types";
import { user, users, posts, post, profiles } from "./data/query";
import { createUser, createProfiles } from "./data/mutation";
import {
  graphql,
  // GraphQLFieldResolver,
  // GraphQLID,
  // GraphQLInt,
  // GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  // GraphQLString,
} from "graphql";
// import { ProfileEntity } from "../../utils/DB/entities/DBProfiles";
// import { UserEntity } from "../../utils/DB/entities/DBUsers";
import { graphqlBodySchema } from "./schema";

// curl -X POST \
// -H "Content-Type: application/json" \
// -d '{"query": "{ hello }"}' \

const Query = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
    users: users,
    user: user,
    posts: posts,
    post: post,
    profiles: profiles,
  }),
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    createUser: createUser,
    createProfiles: createProfiles,
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
        contextValue: fastify,
      });
    }
  );
};

// const UserType = new GraphQLObjectType({
//   name: "User",
//   fields: {
//     firstName: { type: GraphQLString },
//     lastName: { type: GraphQLString },
//     email: { type: GraphQLString },
//   },
// });

// const simpleschema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "Query",
//     fields: {
//       user: {
//         type: UserType,
//         args: {
//           id: { type: GraphQLID },
//         },
//         resolve: (root, args, context, info) => {
//           const { id } = args; // the `id` argument for this field is declared above
//           return id;
//         },
//       },
//     },
//   }),
// });

export default plugin;
