// import DataLoader = require("dataloader");
// import DataLoader from "dataloader";

const postsLoader = new DataLoader(async (userIds) => {
  // Assume, userIds = [ 1, 2 ]

  let posts = await Post.findAll({ where: { userId: userIds } });
  // posts = [ {title: "A", userId: 1}, {title: "B", userId: 1}, {title: "C", userId: 2} ]

  let postsGroupedByUser = userIds.map((userId) => {
    return posts.filter((post) => post.userId == userId);
  });

  // postsGroupedByUser = [
  //  [
  //    {title: "A", userId: 1},
  // 	{title: "B", userId: 1}
  //  ],
  //  [
  //    {title: "C", userId: 2}
  //  ]
  // ]

  return postsGroupedByUser;
});
