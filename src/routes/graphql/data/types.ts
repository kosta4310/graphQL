import DataLoader = require("dataloader");
import { FastifyInstance } from "fastify";
import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
} from "graphql";
import { PostEntity } from "../../../utils/DB/entities/DBPosts";
import { ProfileEntity } from "../../../utils/DB/entities/DBProfiles";
import { UserEntity } from "../../../utils/DB/entities/DBUsers";

export type ResolverContext = {
  fastify: FastifyInstance;
  dataloaders: WeakMap<object, any>;
};

export const UserType: GraphQLOutputType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    id: { type: GraphQLID },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (
        source: UserEntity,
        __,
        { fastify, dataloaders }: ResolverContext,
        info
      ) => {
        let dl: any = dataloaders.get(info.fieldNodes);
        // console.log("info.fieldsNodes", info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids) => {
            const arrayUsers = await fastify.db.users.findMany({
              key: "subscribedToUserIds",
              inArrayAnyOf: ids as Array<string>,
            });
            // console.log("arrayUsers", arrayUsers);

            const sortedInIdsOrder = (ids as Array<string>).map((userid) => {
              return arrayUsers.filter((user) =>
                user.subscribedToUserIds.includes(userid)
              );
            });
            // console.log("sortedInIdsOrder", sortedInIdsOrder);

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(source.id);
        // return await fastify.db.users.findMany({
        //   key: "subscribedToUserIds",
        //   inArray: source.id,
        // });
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (
        source: UserEntity,
        __,
        { fastify, dataloaders }: ResolverContext
      ) => {
        return await fastify.db.users.findMany({
          key: "id",
          equalsAnyOf: source.subscribedToUserIds,
        });
      },
    },
    profile: {
      type: ProfilesType,
      resolve: async (
        source: UserEntity,
        __,
        { fastify, dataloaders }: ResolverContext,
        info
      ) => {
        let dl: any = dataloaders.get(info.fieldNodes);
        // console.log("info.fieldsNodes", info.fieldNodes[0].name.value);
        // console.log("dl", dl);

        if (!dl) {
          dl = new DataLoader(async (ids) => {
            const profiles = await fastify.db.profiles.findMany({
              key: "userId",
              equalsAnyOf: ids as Array<string>,
            });
            // console.log("profiles", profiles);

            const sortedInIdsOrder = ids.map((userid) => {
              return profiles.find((profile) => profile.userId == userid);
            });
            // console.log("sortedInIdsOrder", sortedInIdsOrder);

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(source.id);
        // return await fastify.db.profiles.findOne({
        //   key: "userId",
        //   equals: source.id,
        // });
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (
        source: UserEntity,
        __,
        { fastify, dataloaders }: ResolverContext,
        info
      ) => {
        let dl: any = dataloaders.get(info.fieldNodes);
        // console.log("info.fieldsNodes", info.fieldNodes);

        if (!dl) {
          dl = new DataLoader(async (ids) => {
            const posts = await fastify.db.posts.findMany({
              key: "userId",
              equalsAnyOf: ids as Array<string>,
            });

            const sortedInIdsOrder = ids.map((userid) => {
              return posts.filter((post) => post.userId == userid);
            });

            return sortedInIdsOrder;
          });

          dataloaders.set(info.fieldNodes, dl);
        }

        return dl.load(source.id);
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
        __,
        { fastify, dataloaders }: ResolverContext
      ) => {
        return await fastify.db.memberTypes.findOne({
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
        __,
        { fastify, dataloaders }: ResolverContext
      ) => {
        return await fastify.db.users.findOne({
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

export const ProfilesTypeUpdate = new GraphQLInputObjectType({
  name: "ProfilesUpdate",
  fields: {
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
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
      resolve: async (
        source: PostEntity,
        __,
        { fastify, dataloaders }: ResolverContext
      ) => {
        return await fastify.db.users.findOne({
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

export const PostTypeUpdate = new GraphQLInputObjectType({
  name: "PostUpdate",
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
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

export const MemberTypesTypeUpdate = new GraphQLInputObjectType({
  name: "MemberTypesUpdate",
  fields: () => ({
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  }),
});

export const SubscribeType = new GraphQLInputObjectType({
  name: "Subscribe",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
  }),
});
