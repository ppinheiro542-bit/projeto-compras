export type PostAuthor = {
  full_name: string | null;
  avatar_url: string | null;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author: PostAuthor | null;
};

export type Post = {
  id: string;
  user_id: string;
  caption: string;
  image_url: string | null;
  created_at: string;
  author: PostAuthor | null;
  comments: PostComment[];
};
