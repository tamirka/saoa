# Yazbox - B2B Packaging Marketplace (Supabase Version)

This is the full implementation for Yazbox, a B2B marketplace for custom packaging, connected to a Supabase backend.

## Getting Started

### 1. Supabase Project Setup

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the entire content of the `Supabase Schema` section below and run it in the SQL editor. This will create all the necessary tables, storage buckets, and security policies.

### 2. Environment Variables

Create a `.env` file in the root of your project directory. Add your Supabase project URL and anon key to this file. You can find these in your Supabase project's **API Settings**.

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 3. Run the Application

Once your environment variables are set, you can run the application. It will now be fully connected to your Supabase backend.

---

## Supabase Schema

Copy and paste the entire SQL script below into the Supabase SQL Editor and run it.

```sql
-- =============================================
-- 1. AUTHENTICATION SETUP (PROFILES & TRIGGERS)
-- =============================================
-- Create a table for public user profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'buyer'
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING ( auth.uid() = id );
-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING ( auth.uid() = id );
-- Allow anyone to view any profile (needed for seller info on products)
CREATE POLICY "Anyone can view profiles." ON profiles FOR SELECT USING (true);


-- This trigger automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================
-- 2. SELLERS & PRODUCTS
-- =============================================
-- Create sellers table
CREATE TABLE sellers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  shipping_policy TEXT,
  return_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seller profiles." ON sellers FOR SELECT USING (true);
CREATE POLICY "Sellers can create/update their profile." ON sellers FOR ALL USING (auth.uid() = id);

-- Create categories table and pre-populate
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
INSERT INTO categories (name) VALUES ('Boxes'), ('Pouches'), ('Sachets'), ('Labels'), ('Bags'), ('Tape');


-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL,
  description TEXT,
  min_order_quantity INT NOT NULL DEFAULT 50,
  images TEXT[], -- Array of image URLs from Storage
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products." ON products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products." ON products FOR ALL USING (auth.uid() = seller_id);

-- Create product_variants table
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Small", "Medium"
  paper_type TEXT, -- e.g., "Kraft"
  price_per_unit NUMERIC(10, 2) NOT NULL
);
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product variants." ON product_variants FOR SELECT USING (true);
CREATE POLICY "Sellers can manage variants for their products." ON product_variants FOR ALL USING (
  (SELECT auth.uid()) = (SELECT seller_id FROM products WHERE id = product_id)
);


-- =============================================
-- 3. ORDERS & NOTIFICATIONS
-- =============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders." ON orders FOR ALL USING (auth.uid() = user_id);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    variant_id INT NOT NULL REFERENCES product_variants(id),
    quantity INT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    artwork_url TEXT
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view items in their own orders." ON order_items FOR SELECT USING ((SELECT auth.uid()) = (SELECT user_id FROM orders WHERE id = order_id));


CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications." ON notifications FOR ALL USING (auth.uid() = user_id);


-- =============================================
-- 4. MESSAGING SYSTEM
-- =============================================
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE conversation_participants (
    conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    is_read BOOLEAN DEFAULT FALSE
);

-- RLS for messaging
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access conversations they are part of." ON conversations FOR ALL USING (id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can access participant list of their conversations." ON conversation_participants FOR ALL USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can send/view messages in their conversations." ON messages FOR ALL USING (conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()));

-- DB function to get or create a conversation with another user
CREATE OR REPLACE FUNCTION get_or_create_conversation(recipient_id UUID)
RETURNS INT AS $$
DECLARE
    found_conversation_id INT;
BEGIN
    SELECT cp1.conversation_id INTO found_conversation_id FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = recipient_id;

    IF found_conversation_id IS NULL THEN
        INSERT INTO conversations DEFAULT VALUES RETURNING id INTO found_conversation_id;
        INSERT INTO conversation_participants (conversation_id, user_id) VALUES (found_conversation_id, auth.uid()), (found_conversation_id, recipient_id);
    END IF;
    RETURN found_conversation_id;
END;
$$ LANGUAGE plpgsql;


-- DB view to easily get conversation list with last message and unread count
CREATE OR REPLACE VIEW conversations_with_details AS
SELECT
    c.id AS conversation_id,
    p.user_id AS other_user_id,
    prof.full_name AS other_user_name,
    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
    (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != auth.uid()) AS unread_count
FROM conversations c
JOIN conversation_participants p ON c.id = p.conversation_id AND p.user_id != auth.uid()
JOIN profiles prof ON p.user_id = prof.id
WHERE c.id IN (SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid());


-- =============================================
-- 5. STORAGE SETUP (FILE UPLOADS)
-- =============================================
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('seller_logos', 'seller_logos', TRUE) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product_images', 'product_images', TRUE) ON CONFLICT (id) DO NOTHING;

-- Policies for seller_logos bucket
CREATE POLICY "Sellers can manage their own logo" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'seller_logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view seller logos" ON storage.objects FOR SELECT
USING (bucket_id = 'seller_logos');


-- Policies for product_images bucket
CREATE POLICY "Sellers can manage their product images" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');
```
