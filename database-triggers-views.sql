-- ========================================
-- DATABASE TRIGGERS AND VIEWS
-- Sorsogon Tourism App
-- ========================================

-- ========================================
-- TRIGGERS
-- ========================================

-- 1. Auto-update created_at timestamp for stories
CREATE OR REPLACE FUNCTION update_story_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_story_timestamp
    BEFORE INSERT ON public.story
    FOR EACH ROW
    EXECUTE FUNCTION update_story_timestamp();

-- 2. Auto-update created_at timestamp for travel tips
CREATE OR REPLACE FUNCTION update_travel_tip_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_travel_tip_timestamp
    BEFORE INSERT ON public.travel_tip
    FOR EACH ROW
    EXECUTE FUNCTION update_travel_tip_timestamp();

-- 3. Auto-update created_at timestamp for festivals
CREATE OR REPLACE FUNCTION update_festival_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_festival_timestamp
    BEFORE INSERT ON public.festival
    FOR EACH ROW
    EXECUTE FUNCTION update_festival_timestamp();

-- 4. Auto-update created_at timestamp for contact messages
CREATE OR REPLACE FUNCTION update_contact_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contact_timestamp
    BEFORE INSERT ON public.contact
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_timestamp();

-- 5. Auto-update created_at timestamp for about section
CREATE OR REPLACE FUNCTION update_about_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_about_timestamp
    BEFORE INSERT ON public.about
    FOR EACH ROW
    EXECUTE FUNCTION update_about_timestamp();

-- 6. Auto-update upload_date for media files
CREATE OR REPLACE FUNCTION update_media_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.upload_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_media_timestamp
    BEFORE INSERT ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION update_media_timestamp();

-- 7. Log story approvals for audit trail
CREATE TABLE public.story_approval_log (
    log_id serial primary key,
    story_id int,
    old_approved boolean,
    new_approved boolean,
    changed_by text,
    changed_at timestamptz default now(),
    foreign key (story_id) references public.story(id) on delete cascade
);

CREATE OR REPLACE FUNCTION log_story_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.approved IS DISTINCT FROM NEW.approved THEN
        INSERT INTO public.story_approval_log (story_id, old_approved, new_approved, changed_by)
        VALUES (NEW.id, OLD.approved, NEW.approved, current_user);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_story_approval_log
    AFTER UPDATE ON public.story
    FOR EACH ROW
    EXECUTE FUNCTION log_story_approval();

-- 8. Ensure destination status is valid
CREATE OR REPLACE FUNCTION validate_destination_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('draft', 'published', 'archived') THEN
        RAISE EXCEPTION 'Invalid destination status. Must be: draft, published, or archived';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_destination_status
    BEFORE INSERT OR UPDATE ON public.tourist_destination
    FOR EACH ROW
    EXECUTE FUNCTION validate_destination_status();

-- ========================================
-- VIEWS
-- ========================================

-- 1. View for approved stories with destination info
CREATE OR REPLACE VIEW public.approved_stories_view AS
SELECT 
    s.id,
    s.title,
    s.author_name,
    s.content,
    s.created_at,
    s.image_url,
    s.image_gallery,
    td.name as destination_name,
    td.category as destination_category,
    td.address as destination_address,
    td.coordinates as destination_coordinates
FROM public.story s
JOIN public.tourist_destination td ON s.destination_id = td.destination_id
WHERE s.approved = true
ORDER BY s.created_at DESC;

-- 2. View for pending stories (admin dashboard)
CREATE OR REPLACE VIEW public.pending_stories_view AS
SELECT 
    s.id,
    s.title,
    s.author_name,
    s.created_at,
    td.name as destination_name,
    td.category as destination_category
FROM public.story s
JOIN public.tourist_destination td ON s.destination_id = td.destination_id
WHERE s.approved = false
ORDER BY s.created_at DESC;

-- 3. View for destinations with story count
CREATE OR REPLACE VIEW public.destinations_with_story_count AS
SELECT 
    td.*,
    COUNT(s.id) as story_count,
    COUNT(CASE WHEN s.approved = true THEN 1 END) as approved_story_count
FROM public.tourist_destination td
LEFT JOIN public.story s ON td.destination_id = s.destination_id
GROUP BY td.destination_id, td.name, td.description, td.article_content, 
         td.address, td.coordinates, td.category, td.status, 
         td.image_url, td.image_gallery
ORDER BY td.name;

-- 4. View for stories with tags
CREATE OR REPLACE VIEW public.stories_with_tags_view AS
SELECT 
    s.id,
    s.title,
    s.author_name,
    s.content,
    s.approved,
    s.created_at,
    s.image_url,
    td.name as destination_name,
    COALESCE(
        json_agg(
            json_build_object('tag_id', t.id, 'tag_name', t.name)
        ) FILTER (WHERE t.id IS NOT NULL), 
        '[]'::json
    ) as tags
FROM public.story s
JOIN public.tourist_destination td ON s.destination_id = td.destination_id
LEFT JOIN public.story_tag st ON s.id = st.story_id
LEFT JOIN public.tag t ON st.tag_id = t.id
GROUP BY s.id, s.title, s.author_name, s.content, s.approved, 
         s.created_at, s.image_url, td.name
ORDER BY s.created_at DESC;

-- 5. View for recent contact messages (admin)
CREATE OR REPLACE VIEW public.recent_contact_messages AS
SELECT 
    contact_id,
    name,
    email,
    subject,
    LEFT(message, 100) as message_preview,
    created_at
FROM public.contact
ORDER BY created_at DESC
LIMIT 50;

-- 6. View for upcoming festivals
CREATE OR REPLACE VIEW public.upcoming_festivals_view AS
SELECT 
    id,
    name,
    description,
    start_date,
    end_date,
    location,
    image_url,
    image_gallery,
    created_at,
    CASE 
        WHEN start_date > CURRENT_DATE THEN 'upcoming'
        WHEN start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE) THEN 'ongoing'
        ELSE 'past'
    END as status
FROM public.festival
ORDER BY start_date ASC;

-- 7. View for travel tips by category
CREATE OR REPLACE VIEW public.travel_tips_by_category AS
SELECT 
    id,
    title,
    content,
    author,
    created_at,
    category,
    image_url,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC) as tip_order_in_category
FROM public.travel_tip
ORDER BY category, created_at DESC;

-- 8. View for media files by story
CREATE OR REPLACE VIEW public.media_by_story_view AS
SELECT 
    m.media_id,
    m.story_id,
    s.title as story_title,
    m.file_name,
    m.file_type,
    m.file_url,
    m.upload_date,
    m.caption,
    m.description
FROM public.media m
JOIN public.story s ON m.story_id = s.id
ORDER BY m.upload_date DESC;

-- 9. View for popular tags (with usage count)
CREATE OR REPLACE VIEW public.popular_tags_view AS
SELECT 
    t.id,
    t.name,
    COUNT(st.story_id) as usage_count,
    COUNT(CASE WHEN s.approved = true THEN 1 END) as approved_usage_count
FROM public.tag t
LEFT JOIN public.story_tag st ON t.id = st.tag_id
LEFT JOIN public.story s ON st.story_id = s.id
GROUP BY t.id, t.name
ORDER BY usage_count DESC, t.name;

-- 10. View for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM public.tourist_destination WHERE status = 'published') as published_destinations,
    (SELECT COUNT(*) FROM public.tourist_destination WHERE status = 'draft') as draft_destinations,
    (SELECT COUNT(*) FROM public.story WHERE approved = true) as approved_stories,
    (SELECT COUNT(*) FROM public.story WHERE approved = false) as pending_stories,
    (SELECT COUNT(*) FROM public.festival WHERE start_date >= CURRENT_DATE) as upcoming_festivals,
    (SELECT COUNT(*) FROM public.travel_tip) as total_travel_tips,
    (SELECT COUNT(*) FROM public.contact WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as recent_contacts,
    (SELECT COUNT(*) FROM public.media) as total_media_files;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_story_approved ON public.story(approved);
CREATE INDEX IF NOT EXISTS idx_story_created_at ON public.story(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_destination_status ON public.tourist_destination(status);
CREATE INDEX IF NOT EXISTS idx_festival_start_date ON public.festival(start_date);
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_tag_story_id ON public.story_tag(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tag_tag_id ON public.story_tag(tag_id);
CREATE INDEX IF NOT EXISTS idx_media_story_id ON public.media(story_id);
CREATE INDEX IF NOT EXISTS idx_media_upload_date ON public.media(upload_date DESC);

-- ========================================
-- SECURITY POLICIES (RLS)
-- ========================================

-- Enable Row Level Security
ALTER TABLE public.story ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policy for stories (public can read approved stories, authenticated can read all)
CREATE POLICY "Public can view approved stories" ON public.story
    FOR SELECT USING (approved = true);

CREATE POLICY "Authenticated users can view all stories" ON public.story
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for contact messages (only authenticated users can insert)
CREATE POLICY "Authenticated users can insert contact messages" ON public.contact
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for media (public can view, authenticated can insert)
CREATE POLICY "Public can view media" ON public.media
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert media" ON public.media
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ========================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ========================================

-- Function to get stories by destination
CREATE OR REPLACE FUNCTION get_stories_by_destination(p_destination_id int, p_only_approved boolean = true)
RETURNS TABLE (
    id int,
    title text,
    author_name text,
    content text,
    created_at timestamptz,
    image_url text,
    destination_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.author_name,
        s.content,
        s.created_at,
        s.image_url,
        td.name as destination_name
    FROM public.story s
    JOIN public.tourist_destination td ON s.destination_id = td.destination_id
    WHERE s.destination_id = p_destination_id
    AND (p_only_approved = false OR s.approved = true)
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search stories by text
CREATE OR REPLACE FUNCTION search_stories(p_search_term text)
RETURNS TABLE (
    id int,
    title text,
    author_name text,
    content text,
    created_at timestamptz,
    destination_name text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.author_name,
        s.content,
        s.created_at,
        td.name as destination_name
    FROM public.story s
    JOIN public.tourist_destination td ON s.destination_id = td.destination_id
    WHERE s.approved = true
    AND (
        to_tsvector('english', s.title || ' ' || s.content || ' ' || td.name) 
        @@ to_tsquery('english', p_search_term)
    )
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
