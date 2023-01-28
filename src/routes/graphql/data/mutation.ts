import { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLInt, GraphQLString } from "graphql";
import { CreatePostDTO } from "../../../utils/DB/entities/DBPosts";
import { CreateProfileDTO } from "../../../utils/DB/entities/DBProfiles";
import { CreateUserDTO } from "../../../utils/DB/entities/DBUsers";
import { PostType, ProfilesType, UserType } from "./types";

export const createUser = {
  type: UserType,
  args: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
  },
  resolve: async (
    _source: any,
    args: CreateUserDTO,
    context: FastifyInstance
  ) => {
    return await context.db.users.create(args);
  },
};

export const createPost = {
  type: PostType,
  args: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLID },
  },
  resolve: async (
    _source: any,
    args: CreatePostDTO,
    context: FastifyInstance
  ) => {
    const user = await context.db.users.findOne({
      key: "id",
      equals: args.userId,
    });

    if (!user) {
      return context.httpErrors.badRequest();
    }
    return await context.db.posts.create(args);
  },
};

export const createProfiles = {
  type: ProfilesType,
  args: {
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLID },
  },
  resolve: async (
    _source: any,
    args: CreateProfileDTO,
    context: FastifyInstance
  ) => {
    const userId = args.userId;
    const user = await context.db.users.findOne({
      key: "id",
      equals: userId,
    });
    console.log("user", user);

    if (!user) {
      return context.httpErrors.badRequest();
    }

    const profile = await context.db.profiles.findOne({
      key: "userId",
      equals: userId,
    });

    if (profile) {
      return context.httpErrors.badRequest();
    }

    const memberTypeId = await context.db.memberTypes.findOne({
      key: "id",
      equals: args.memberTypeId,
    });
    console.log("memberType", memberTypeId);

    if (!memberTypeId) {
      return context.httpErrors.badRequest();
    }
    return await context.db.profiles.create(args);
  },
};
