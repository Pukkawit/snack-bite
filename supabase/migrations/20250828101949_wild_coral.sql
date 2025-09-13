/*
# SnackBite Restaurant Schema

1. New Tables
   - `menu_items` - Store all menu items with categories, pricing, and availability
   - `opening_hours` - Business operating hours for each day of the week
   - `restaurant_info` - General restaurant information and settings
   - `promo_banners` - Promotional content for special offers

2. Security
   - Enable RLS on all tables
   - Add policies for public read access and authenticated admin write access

3. Sample Data
   - Insert sample menu items for demonstration
   - Add standard business hours
   - Include promotional banner examples
*/

-- Menu Items Table
CREATE TABLE IF NOT EXISTS snack-bite_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text CHECK (category IN ('snacks', 'drinks', 'specials', 'desserts')) NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Opening Hours Table
CREATE TABLE IF NOT EXISTS snack-bite_opening_hours (
  id serial PRIMARY KEY,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  open_time time NOT NULL,
  close_time time NOT NULL,
  is_closed boolean DEFAULT false
);

-- Restaurant Info Table
CREATE TABLE IF NOT EXISTS snack-bite_restaurant_info (
  id serial PRIMARY KEY,
  name text NOT NULL DEFAULT 'SnackBite',
  tagline text DEFAULT 'Delicious Bites, Anytime',
  description text,
  address text,
  phone text,
  whatsapp text,
  email text,
  google_maps_embed text,
  updated_at timestamptz DEFAULT now()
);

-- Promo Banners Table
CREATE TABLE IF NOT EXISTS snack-bite_promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  active boolean DEFAULT true,
  background_color text DEFAULT '#ff6b35',
  text_color text DEFAULT '#ffffff',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE snack-bite_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE snack-bite_opening_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE snack-bite_restaurant_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE snack-bite_promo_banners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Menu items are viewable by everyone"
  ON snack-bite_menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Opening hours are viewable by everyone"
  ON snack-bite_opening_hours FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Restaurant info is viewable by everyone"
  ON snack-bite_restaurant_info FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Active promo banners are viewable by everyone"
  ON snack-bite_promo_banners FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for authenticated admin access
CREATE POLICY "Authenticated users can manage menu items"
  ON snack-bite_menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage opening hours"
  ON snack-bite_opening_hours FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage restaurant info"
  ON snack-bite_restaurant_info FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage promo banners"
  ON snack-bite_promo_banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO snack-bite_menu_items (name, description, price, category, image_url, is_featured) VALUES
  ('Classic Burger', 'Juicy beef patty with fresh lettuce, tomato, and our signature sauce', 12.99, 'snacks', 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', true),
  ('Crispy Chicken Wings', '8 pieces of golden crispy wings with choice of sauce', 15.99, 'snacks', 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', true),
  ('Fresh Lemonade', 'Freshly squeezed lemon with mint and sparkling water', 4.99, 'drinks', 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', false),
  ('Chocolate Milkshake', 'Rich chocolate milkshake topped with whipped cream', 6.99, 'drinks', 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg', false),
  ('Loaded Nachos', 'Crispy tortilla chips with melted cheese, jalapeños, and salsa', 9.99, 'specials', 'https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg', true),
  ('Cheesecake Slice', 'Creamy New York style cheesecake with berry compote', 7.99, 'desserts', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg', false);

INSERT INTO snack-bite_opening_hours (day_of_week, open_time, close_time) VALUES
  ('Monday', '10:00', '22:00'),
  ('Tuesday', '10:00', '22:00'),
  ('Wednesday', '10:00', '22:00'),
  ('Thursday', '10:00', '23:00'),
  ('Friday', '10:00', '23:00'),
  ('Saturday', '09:00', '23:00'),
  ('Sunday', '09:00', '21:00');

INSERT INTO snack-bite_restaurant_info (name, tagline, description, address, phone, whatsapp, email, google_maps_embed) VALUES
  ('SnackBite', 'Delicious Bites, Anytime', 'We serve the most delicious native food, snacks and refreshing drinks in town. Made fresh daily with the finest ingredients, our menu offers something special for every craving.', '123 Food Street, Flavor Town, FT 12345', '+234 813 68 4567', '+23881385448', 'hello@snackbite.com', '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368459391!3d40.71312937933041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a22a3bda30d%3A0xb89d1fe6bc499443!2sDowntown%20Conference%20Center!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>');

INSERT INTO snack-bite_promo_banners (title, description, background_color, text_color) VALUES
  ('Weekend Special!', 'Buy 2 Burgers Get 1 FREE - Valid Friday to Sunday', '#ff6b35', '#ffffff'),
  ('Happy Hour', '50% off all drinks from 3PM - 6PM daily', '#4ade80', '#000000');