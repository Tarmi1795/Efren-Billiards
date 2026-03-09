-- Create the rankings table
CREATE TABLE IF NOT EXISTS public.rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_type TEXT NOT NULL CHECK (game_type IN ('billiards', 'darts', 'chess')),
    rank INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    score INTEGER DEFAULT 0,
    trend TEXT DEFAULT 'same' CHECK (trend IN ('up', 'down', 'same')),
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view rankings
DROP POLICY IF EXISTS "Rankings are viewable by everyone" ON public.rankings;
CREATE POLICY "Rankings are viewable by everyone" ON public.rankings
    FOR SELECT USING (true);

-- Allow admins to manage rankings
DROP POLICY IF EXISTS "Admins can manage rankings" ON public.rankings;
CREATE POLICY "Admins can manage rankings" ON public.rankings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.tier = 'Admin' OR profiles.role = 'admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND (profiles.tier = 'Admin' OR profiles.role = 'admin')
        )
    );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_rankings_updated_at ON public.rankings;
CREATE TRIGGER set_rankings_updated_at
    BEFORE UPDATE ON public.rankings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Seed some initial rankings for Billiards
INSERT INTO public.rankings (game_type, rank, player_name, score, trend)
VALUES 
    ('billiards', 1, 'Efren Reyes', 10000, 'same'),
    ('billiards', 2, 'Francisco Bustamante', 9500, 'up'),
    ('billiards', 3, 'Ronnie Alcano', 9000, 'down')
ON CONFLICT DO NOTHING;

-- Seed initial rankings for Darts
INSERT INTO public.rankings (game_type, rank, player_name, score, trend)
VALUES 
    ('darts', 1, 'Tarek M.', 1420, 'same'),
    ('darts', 2, 'Sarah J.', 1385, 'up'),
    ('darts', 3, 'Ahmed Q.', 1350, 'down')
ON CONFLICT DO NOTHING;

-- Seed initial rankings for Chess
INSERT INTO public.rankings (game_type, rank, player_name, score, trend)
VALUES 
    ('chess', 1, 'Eugenio T.', 2450, 'same'),
    ('chess', 2, 'Wesley S.', 2380, 'up'),
    ('chess', 3, 'Rogelio A.', 2200, 'down')
ON CONFLICT DO NOTHING;
