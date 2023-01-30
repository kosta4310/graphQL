import { MemberTypesType, PostType, ProfilesType, UserType } from "./types";
import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { HttpError } from "@fastify/sensible/lib/httpError";

export const users = {
  type: new GraphQLList(UserType),
  resolve: async (_source: any, _args: any, { fastify, dataloaders }: any) => {
    return await fastify.db.users.findMany();
  },
};

export const user = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (
    _source: any,
    args: { id: string },
    { fastify, dataloaders }: any
  ): Promise<UserEntity | HttpError> => {
    const userId = args.id;
    const res = await fastify.db.users.findOne({
      key: "id",
      equals: userId,
    });

    if (!res) {
      return fastify.httpErrors.notFound();
    }
    return res;
  },
};

export const posts = {
  type: new GraphQLList(PostType),
  resolve: async (_source: any, _args: any, { fastify, dataloaders }: any) => {
    return await fastify.db.posts.findMany();
  },
};

export const post = {
  type: PostType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve: async (
    _source: any,
    args: { id: string },
    { fastify, dataloaders }: any
  ) => {
    const res = await fastify.db.posts.findOne({
      key: "id",
      equals: args.id,
    });

    if (!res) {
      return fastify.httpErrors.notFound();
    }
    return res;
  },
};

export const profiles = {
  type: new GraphQLList(ProfilesType),
  resolve: async (_source: any, _args: any, { fastify, dataloaders }: any) => {
    return await fastify.db.profiles.findMany();
  },
};

export const profile = {
  type: ProfilesType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (
    _source: any,
    args: { id: string },
    { fastify, dataloaders }: any
  ) => {
    const res = await fastify.db.profiles.findOne({
      key: "id",
      equals: args.id,
    });

    if (!res) {
      return fastify.httpErrors.notFound();
    }
    return res;
  },
};

export const memberType = {
  type: MemberTypesType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (
    _source: any,
    args: { id: string },
    { fastify, dataloaders }: any
  ) => {
    const res = await fastify.db.memberTypes.findOne({
      key: "id",
      equals: args.id,
    });
    if (!res) {
      return fastify.httpErrors.notFound();
    }
    return res;
  },
};

export const memberTypes = {
  type: new GraphQLList(MemberTypesType),
  resolve: async (_source: any, _args: any, { fastify, dataloaders }: any) => {
    return await fastify.db.memberTypes.findMany();
  },
};
