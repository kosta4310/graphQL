import { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLNonNull, GraphQLString } from "graphql";
import { ChangeMemberTypeDTO } from "../../../utils/DB/entities/DBMemberTypes";
import { CreatePostDTO } from "../../../utils/DB/entities/DBPosts";
import { CreateProfileDTO } from "../../../utils/DB/entities/DBProfiles";

import {
  MemberTypesType,
  MemberTypesTypeUpdate,
  PostType,
  PostTypeInput,
  PostTypeUpdate,
  ProfilesType,
  ProfilesTypeInput,
  ProfilesTypeUpdate,
  SubscribeType,
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

// type UpdateUserType = {
//   userId: String;
//   input: ChangeUserDTO;
// }

export const updateUser = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    input: { type: new GraphQLNonNull(UserTypeInput) },
  },
  resolve: async (
    _source: any,
    // args: { id: String; input: ChangeUserDTO },
    args: any,
    context: FastifyInstance
  ) => {
    const user = await context.db.users.findOne({
      key: "id",
      equals: args.id,
    });

    if (!user) {
      return context.httpErrors.badRequest();
    }
    return await context.db.users.change(args.id, args.input);
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

export const updatePost = {
  type: PostType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    input: {
      type: new GraphQLNonNull(PostTypeUpdate),
    },
  },
  resolve: async (
    _source: any,
    // args: {id: String, input: CreatePostDTO },
    args: any,
    context: FastifyInstance
  ) => {
    const post = await context.db.posts.findOne({
      key: "id",
      equals: args.id,
    });

    if (!post) {
      return context.httpErrors.badRequest();
    }

    return await context.db.posts.change(args.id, args.input);
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

export const updateProfiles = {
  type: ProfilesType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    input: { type: new GraphQLNonNull(ProfilesTypeUpdate) },
  },
  resolve: async (
    _source: any,
    // args: { id: String; input: CreateProfileDTO },
    args: any,
    context: FastifyInstance
  ) => {
    const profileId = args.id;
    const profile = await context.db.profiles.findOne({
      key: "id",
      equals: profileId,
    });

    if (!profile) {
      return context.httpErrors.badRequest();
    }

    return await context.db.profiles.change(args.id, args.input);
  },
};

export const updateMemberTypes = {
  type: MemberTypesType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    input: { type: new GraphQLNonNull(MemberTypesTypeUpdate) },
  },
  resolve: async (
    _source: any,
    args: { id: any; input: ChangeMemberTypeDTO },
    context: FastifyInstance
  ) => {
    const memberTypesId = args.id;
    const res = await context.db.memberTypes.findOne({
      key: "id",
      equals: args.id,
    });

    if (!res) {
      return context.httpErrors.badRequest();
    }

    return await context.db.memberTypes.change(memberTypesId, args.input);
  },
};

// Subscribe to; unsubscribe from.

export const subscribeTo = {
  type: UserType,
  args: {
    input: { type: new GraphQLNonNull(SubscribeType) },
  },
  resolve: async (_source: any, args: any, context: FastifyInstance) => {
    const u1Id: string = args.input.id;
    const u2Id: string = args.input.userId;

    const u1 = await context.db.users.findOne({ key: "id", equals: u1Id });
    if (!u1) {
      return context.httpErrors.badRequest();
    }

    const u2 = await context.db.users.findOne({ key: "id", equals: u2Id });
    if (!u2) {
      return context.httpErrors.badRequest();
    }

    let arr = u2.subscribedToUserIds;
    arr.push(u1Id);

    return await context.db.users.change(u2Id, {
      subscribedToUserIds: arr,
    });
  },
};

export const unsubscribeFrom = {
  type: UserType,
  args: {
    input: { type: new GraphQLNonNull(SubscribeType) },
  },
  resolve: async (_source: any, args: any, context: FastifyInstance) => {
    const u1Id: string = args.input.id;
    const u2Id: string = args.input.userId;

    const u1 = await context.db.users.findOne({ key: "id", equals: u1Id });
    if (!u1) {
      return context.httpErrors.badRequest();
    }

    const u2 = await context.db.users.findOne({ key: "id", equals: u2Id });
    if (!u2) {
      return context.httpErrors.badRequest();
    }

    let arr = u2.subscribedToUserIds;
    const lengthBefore = arr.length;
    const resArray = arr.filter((id) => id !== u1Id);
    const lengthAfter = resArray.length;

    if (lengthAfter === lengthBefore) {
      return context.httpErrors.badRequest();
    }

    return await context.db.users.change(u2Id, {
      subscribedToUserIds: resArray,
    });
  },
};
