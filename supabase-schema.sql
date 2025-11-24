-- TOURIST DESTINATION
create table public.tourist_destination (
  destination_id serial primary key,
  name text not null,
  description text,
  article_content text,
  address text,
  coordinates text,
  category text,
  status text default 'draft',
  image_url text,
  image_gallery jsonb default '[]'
);

-- STORY
-- Note: Code expects 'id' not 'story_id', 'title' not 'story_title', 'created_at' not 'date_posted'
create table public.story (
  id serial primary key,
  destination_id int references public.tourist_destination(destination_id) on delete cascade,
  title text not null,
  author_name text,
  content text,
  approved boolean default false,
  created_at timestamptz default now(),
  image_url text,
  image_gallery jsonb default '[]'
);

-- TAG
-- Note: Code expects 'id' not 'tag_id', 'name' not 'tag_name'
create table public.tag (
  id serial primary key,
  name text unique not null
);

-- STORY TAG (junction table)
create table public.story_tag (
  story_tag_id serial primary key,
  story_id int references public.story(id) on delete cascade,
  tag_id int references public.tag(id) on delete cascade
);

-- MEDIA
create table public.media (
  media_id serial primary key,
  story_id int references public.story(id) on delete cascade,
  file_name text,
  file_type text,
  file_url text,
  upload_date timestamptz default now(),
  caption text,
  description text
);

-- TRAVEL TIP
-- Note: Code expects 'id' not 'travel_tip_id', 'created_at' not 'date_posted'
create table public.travel_tip (
  id serial primary key,
  title text not null,
  content text,
  author text,
  created_at timestamptz default now(),
  category text,
  image_url text
);

-- CONTACT
-- Note: Code expects 'name' not 'full_name', 'email' field is required, 'created_at' not 'date_sent'
create table public.contact (
  contact_id serial primary key,
  name text,
  email text,
  contact_no text,
  subject text,
  message text,
  attachments jsonb default '[]',
  created_at timestamptz default now()
);

-- ABOUT
-- Note: Code expects 'id' not 'about_id', 'description' not 'content', 'created_at' not 'last_updated'
create table public.about (
  id serial primary key,
  description text,
  hero_image text,
  gallery_images jsonb default '[]',
  culture_sections jsonb default '[]',
  created_at timestamptz default now()
);

-- FESTIVAL
create table public.festival (
  id serial primary key,
  name text not null,
  description text,
  start_date date not null,
  end_date date,
  location text,
  image_url text,
  image_gallery jsonb default '[]',
  created_at timestamptz default now()
);

