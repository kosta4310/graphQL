// import { FastifyInstance } from "fastify";
import {
  //   graphql,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  //   GraphQLSchema,
  GraphQLString,
} from "graphql";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    id: { type: GraphQLID },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
  }),
});

export const ProfilesType = new GraphQLObjectType({
  name: "Profiles",
  fields: () => ({
    id: { type: GraphQLString },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLID },
    // user: {
    //   type: UserType,
    //   resolve: async (source, args, context: FastifyInstance) => {
    //     return await context.db.users.findOne({
    //       key: "id",
    //       equals: source.userId,
    //     });
    //   },
    // },
  }),
});

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  }),
});
