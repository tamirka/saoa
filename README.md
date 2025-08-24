# Yazbox Frontend Marketplace

This is the frontend implementation for Yazbox, a B2B marketplace for custom packaging.

## Project Structure

- `/src/components`: Reusable UI components.
- `/src/pages`: Top-level page components.
- `/src/context`: React context providers for global state (Theme, Auth, Cart).
- `/src/hooks`: Custom hooks for accessing context.
- `/src/lib`: Utilities and services, including Supabase client, API functions, and auth helpers.
- `/src/types.ts`: TypeScript type definitions.

## Getting Started

The project is set up to run in a web-based development environment.

### Supabase Integration Setup

This project is now fully integrated with Supabase for backend services.

1.  **Set up Environment Variables**:
    Use your platform's secret management (e.g., Vercel Environment Variables) to set your Supabase project credentials:

    ```
    VITE_SUPABASE_URL=your-supabase-project-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

2.  **Set up Database Schema**:
    Navigate to the **SQL Editor** in your Supabase project dashboard. Copy the entire SQL script from the "Supabase Schema" section below and run it to create all the necessary tables and security policies.

---

## Supabase Schema

Run the following SQL in your Supabase SQL Editor to set up the database.

```sql
-- Supabase Schema for Yazbox Marketplace

-- 1. Profiles table to store user data linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Sellers table
CREATE TABLE public.sellers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  shipping_policy TEXT,
  return_policy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for sellers
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers data is publicly visible." ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Sellers can create/update their profile." ON public.sellers FOR ALL USING (auth.uid() = id);


-- 3. Categories table
CREATE TABLE public.categories (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly visible." ON public.categories FOR SELECT USING (true);
-- Add INSERT/UPDATE/DELETE policies for admins as needed.


-- 4. Products table
CREATE TABLE public.products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES public.categories(id),
  image_url TEXT,
  images TEXT[],
  min_order_quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly visible." ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products." ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'seller' AND id = seller_id)
);


-- 5. Product Variants table
CREATE TABLE public.product_variants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Small", "Medium"
  paper_type TEXT,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product variants are publicly visible." ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Sellers can manage variants for their products." ON public.product_variants FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
);


-- 6. Reviews table
CREATE TABLE public.reviews (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are publicly visible." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews." ON public.reviews FOR ALL USING (auth.uid() = author_id);


-- 7. Product FAQs table
CREATE TABLE public.product_faqs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for product_faqs
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product FAQs are publicly visible." ON public.product_faqs FOR SELECT USING (true);
CREATE POLICY "Sellers can manage FAQs for their products." ON public.product_faqs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND seller_id = auth.uid())
);


-- 8. Orders table
CREATE TABLE public.orders (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'Pending',
  total NUMERIC(10, 2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own orders." ON public.orders FOR ALL USING (auth.uid() = user_id);


-- 9. Order Items table
CREATE TABLE public.order_items (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES public.products(id),
  variant_id BIGINT NOT NULL REFERENCES public.product_variants(id),
  quantity INT NOT NULL,
  price_at_purchase NUMERIC(10, 2) NOT NULL,
  artwork_url TEXT
);

-- RLS Policy for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see items in their own orders." ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
-- Write access should be handled by server-side logic (e.g., Edge Functions) for security.


-- 10. Notifications table
CREATE TABLE public.notifications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id);


-- 11. MESSAGING SCHEMA
-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Table to hold conversations
CREATE TABLE public.conversations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view conversations they are in." ON public.conversations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = id AND user_id = auth.uid()
  )
);

-- Join table for users and conversations
CREATE TABLE public.conversation_participants (
  conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- RLS for conversation_participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own participation." ON public.conversation_participants FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their own participation." ON public.conversation_participants FOR ALL USING (user_id = auth.uid());


-- Table for messages
CREATE TABLE public.messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations." ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can send messages in their conversations." ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
  )
);


-- DB function to create a conversation if one doesn't exist
CREATE OR REPLACE FUNCTION get_or_create_conversation(recipient_id UUID)
RETURNS BIGINT AS $$
DECLARE
  conversation_id BIGINT;
  current_user_id UUID := auth.uid();
BEGIN
  -- Find an existing conversation between the two users
  SELECT cp1.conversation_id INTO conversation_id
  FROM conversation_participants AS cp1
  JOIN conversation_participants AS cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = current_user_id AND cp2.user_id = recipient_id;

  -- If no conversation is found, create a new one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conversation_id;
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (conversation_id, current_user_id), (conversation_id, recipient_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 12. Storage Buckets for Images
-- Seller Logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller_logos', 'seller_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Product Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- Allow sellers to upload logos and product images
CREATE POLICY "Sellers can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'seller_logos' OR bucket_id = 'product_images') AND
  (storage.owner_uid() = auth.uid())
);

-- Allow anyone to view images
CREATE POLICY "Images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'seller_logos' OR bucket_id = 'product_images' );
```