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
  resolve: async (_source: any, args: any, { fastify, dataloaders }: any) => {
    const rr = await fastify.db.users.create(args.input);
    console.log("rrr: ", rr);
    console.log(typeof rr);

    return rr;
  },
};

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
    { fastify, dataloaders }: any
  ) => {
    const user = await fastify.db.users.findOne({
      key: "id",
      equals: args.id,
    });

    if (!user) {
      return fastify.httpErrors.badRequest();
    }
    return await fastify.db.users.change(args.id, args.input);
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
    { fastify, dataloaders }: any
  ) => {
    const user = await fastify.db.users.findOne({
      key: "id",
      equals: args.input.userId,
    });

    if (!user) {
      return fastify.httpErrors.badRequest();
    }
    return await fastify.db.posts.create(args.input);
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
    { fastify, dataloaders }: any
  ) => {
    const post = await fastify.db.posts.findOne({
      key: "id",
      equals: args.id,
    });

    if (!post) {
      return fastify.httpErrors.badRequest();
    }

    return await fastify.db.posts.change(args.id, args.input);
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
    { fastify, dataloaders }: any
  ) => {
    const userId = args.input.userId;
    const user = await fastify.db.users.findOne({
      key: "id",
      equals: userId,
    });
    console.log("user", user);

    if (!user) {
      return fastify.httpErrors.badRequest();
    }

    const profile = await fastify.db.profiles.findOne({
      key: "userId",
      equals: userId,
    });

    if (profile) {
      return fastify.httpErrors.badRequest();
    }

    const memberTypeId = await fastify.db.memberTypes.findOne({
      key: "id",
      equals: args.input.memberTypeId,
    });
    console.log("memberType", memberTypeId);

    if (!memberTypeId) {
      return fastify.httpErrors.badRequest();
    }
    return await fastify.db.profiles.create(args.input);
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
    { fastify, dataloaders }: any
  ) => {
    const profileId = args.id;
    const profile = await fastify.db.profiles.findOne({
      key: "id",
      equals: profileId,
    });

    if (!profile) {
      return fastify.httpErrors.badRequest();
    }

    return await fastify.db.profiles.change(args.id, args.input);
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
    { fastify, dataloaders }: any
  ) => {
    const memberTypesId = args.id;
    const res = await fastify.db.memberTypes.findOne({
      key: "id",
      equals: args.id,
    });

    if (!res) {
      return fastify.httpErrors.badRequest();
    }

    return await fastify.db.memberTypes.change(memberTypesId, args.input);
  },
};

// Subscribe to; unsubscribe from.

export const subscribeTo = {
  type: UserType,
  args: {
    input: { type: new GraphQLNonNull(SubscribeType) },
  },
  resolve: async (_source: any, args: any, { fastify, dataloaders }: any) => {
    const u1Id: string = args.input.id;
    const u2Id: string = args.input.userId;

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
  },
};

export const unsubscribeFrom = {
  type: UserType,
  args: {
    input: { type: new GraphQLNonNull(SubscribeType) },
  },
  resolve: async (_source: any, args: any, { fastify, dataloaders }: any) => {
    const u1Id: string = args.input.id;
    const u2Id: string = args.input.userId;

    const u1 = await fastify.db.users.findOne({ key: "id", equals: u1Id });
    if (!u1) {
      return fastify.httpErrors.badRequest();
    }

    const u2 = await fastify.db.users.findOne({ key: "id", equals: u2Id });
    if (!u2) {
      return fastify.httpErrors.badRequest();
    }

    let arr: Array<string> = u2.subscribedToUserIds;
    const lengthBefore = arr.length;
    const resArray = arr.filter((id) => id !== u1Id);
    const lengthAfter = resArray.length;

    if (lengthAfter === lengthBefore) {
      return fastify.httpErrors.badRequest();
    }

    return await fastify.db.users.change(u2Id, {
      subscribedToUserIds: resArray,
    });
  },
};
