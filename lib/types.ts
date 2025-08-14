export type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  user_id: string;
  created_at: string;
};

export type Profile = {
  id: string;        // equals auth user id
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};
