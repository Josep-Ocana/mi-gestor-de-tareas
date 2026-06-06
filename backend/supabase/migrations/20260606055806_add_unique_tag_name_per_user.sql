ALTER TABLE public.tags
  ADD CONSTRAINT unique_tag_name_per_user UNIQUE (owner_id, name);