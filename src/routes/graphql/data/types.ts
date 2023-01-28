// import { FastifyInstance } from "fastify";
import { FastifyInstance } from "fastify";
import {
  //   graphql,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  //   GraphQLSchema,
  GraphQLString,
} from "graphql";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";

export const UserType: GraphQLOutputType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    id: { type: GraphQLID },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
    profile: {
      type: ProfilesType,
      resolve: async (source: UserEntity, args, context: FastifyInstance) => {
        return await context.db.profiles.findOne({
          key: "userId",
          equals: source.id,
        });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (source: UserEntity, args, context: FastifyInstance) => {
        return await context.db.posts.findMany({
          key: "userId",
          equals: source.id,
        });
      },
    },
  }),
});

export const UserTypeInput = new GraphQLInputObjectType({
  name: "UserInput",
  fields: {
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const ProfilesType: GraphQLOutputType = new GraphQLObjectType({
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
    memberTypes: {
      type: MemberTypesType,
      resolve: async (
        source: ProfileEntity,
        args,
        context: FastifyInstance
      ) => {
        return await context.db.memberTypes.findOne({
          key: "id",
          equals: source.memberTypeId,
        });
      },
    },
    userId: { type: GraphQLID },
    user: {
      type: UserType,
      resolve: async (
        source: ProfileEntity,
        args,
        context: FastifyInstance
      ) => {
        return await context.db.users.findOne({
          key: "id",
          equals: source.userId,
        });
      },
    },
  }),
});

export const ProfilesTypeInput = new GraphQLInputObjectType({
  name: "ProfilesInput",
  fields: {
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const PostType: GraphQLOutputType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLID },
    user: {
      type: UserType,
      resolve: async (source: PostEntity, args, context: FastifyInstance) => {
        return await context.db.users.findOne({
          key: "id",
          equals: source.userId,
        });
      },
    },
  }),
});

export const PostTypeInput = new GraphQLInputObjectType({
  name: "PostInput",
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const MemberTypesType = new GraphQLObjectType({
  name: "MemberTypes",
  fields: () => ({
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});
