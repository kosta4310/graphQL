import { PostType, ProfilesType, UserType } from "./types";
import { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLList } from "graphql";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";
import { HttpError } from "@fastify/sensible/lib/httpError";

export const users = {
  type: new GraphQLList(UserType),
  resolve: async (_source: any, _args: any, context: FastifyInstance) => {
    return await context.db.users.findMany();
  },
};

export const user = {
  type: UserType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: async (
    _source: any,
    args: { id: string },
    context: FastifyInstance
  ): Promise<UserEntity | HttpError> => {
    const userId = args.id;
    const res = await context.db.users.findOne({
      key: "id",
      equals: userId,
    });

    if (!res) {
      return context.httpErrors.notFound();
    }
    return res;
  },
};

export const posts = {
  type: new GraphQLList(PostType),
  resolve: async (_source: any, _args: any, context: FastifyInstance) => {
    return await context.db.posts.findMany();
  },
};

export const post = {
  type: PostType,
  resolve: async (
    _source: any,
    args: { id: string },
    context: FastifyInstance
  ) => {
    const res = await context.db.posts.findOne({
      key: "id",
      equals: args.id,
    });

    if (!res) {
      return context.httpErrors.notFound();
    }
    return res;
  },
};

export const profiles = {
  type: ProfilesType,
  resolve: async (
    _source: any,
    args: { id: string },
    context: FastifyInstance
  ) => {
    if (args.id) {
      const res = await context.db.profiles.findOne({
        key: "id",
        equals: args.id,
      });

      if (!res) {
        return context.httpErrors.notFound();
      }
      return res;
    }
    return await context.db.profiles.findMany();
  },
};
