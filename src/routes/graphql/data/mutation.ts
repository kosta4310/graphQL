import { FastifyInstance } from "fastify";
import { GraphQLNonNull } from "graphql";
import { CreatePostDTO } from "../../../utils/DB/entities/DBPosts";
import { CreateProfileDTO } from "../../../utils/DB/entities/DBProfiles";
import {
  PostType,
  PostTypeInput,
  ProfilesType,
  ProfilesTypeInput,
  UserType,
  UserTypeInput,
} from "./types";

export const createUser = {
  type: UserType,
  args: {
    input: { type: new GraphQLNonNull(UserTypeInput) },
  },

  resolve: async (_source: any, args: any, context: FastifyInstance) => {
    return await context.db.users.create(args.input);
  },
};

export const createPost = {
  type: PostType,
  args: {
    input: {
      type: new GraphQLNonNull(PostTypeInput),
    },
  },
  resolve: async (
    _source: any,
    args: { input: CreatePostDTO },
    context: FastifyInstance
  ) => {
    const user = await context.db.users.findOne({
      key: "id",
      equals: args.input.userId,
    });

    if (!user) {
      return context.httpErrors.badRequest();
    }
    return await context.db.posts.create(args.input);
  },
};

export const createProfiles = {
  type: ProfilesType,
  args: {
    input: { type: new GraphQLNonNull(ProfilesTypeInput) },
  },
  resolve: async (
    _source: any,
    args: { input: CreateProfileDTO },
    context: FastifyInstance
  ) => {
    const userId = args.input.userId;
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
      equals: args.input.memberTypeId,
    });
    console.log("memberType", memberTypeId);

    if (!memberTypeId) {
      return context.httpErrors.badRequest();
    }
    return await context.db.profiles.create(args.input);
  },
};
