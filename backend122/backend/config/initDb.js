const db = require('./db');

const seedCities = [
  {
    name: 'Interlaken',
    country: 'Switzerland',
    region: 'Europe',
    cost_index: 5,
    popularity: 95,
    tags: ['paragliding', 'mountains', 'hiking', 'adventure', 'scenery'],
    image_url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Pokhara',
    country: 'Nepal',
    region: 'Asia',
    cost_index: 1,
    popularity: 88,
    tags: ['paragliding', 'trekking', 'lakes', 'mountains', 'adventure'],
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Queenstown',
    country: 'New Zealand',
    region: 'Oceania',
    cost_index: 4,
    popularity: 94,
    tags: ['paragliding', 'bungee-jumping', 'skiing', 'adventure', 'lakes'],
    image_url: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    cost_index: 2,
    popularity: 98,
    tags: ['beach', 'surfing', 'culture', 'temples', 'nightlife'],
    image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    cost_index: 4,
    popularity: 99,
    tags: ['city', 'food', 'shopping', 'technology', 'culture'],
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    cost_index: 4,
    popularity: 97,
    tags: ['romance', 'museums', 'art', 'food', 'history'],
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    cost_index: 3,
    popularity: 96,
    tags: ['history', 'architecture', 'food', 'culture', 'museums'],
    image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    cost_index: 3,
    popularity: 95,
    tags: ['architecture', 'beach', 'nightlife', 'food', 'culture'],
    image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    cost_index: 2,
    popularity: 91,
    tags: ['beaches', 'hiking', 'paragliding', 'wine', 'nature'],
    image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Europe',
    cost_index: 5,
    popularity: 92,
    tags: ['aurora', 'geysers', 'nature', 'glaciers', 'hiking'],
    image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    cost_index: 2,
    popularity: 90,
    tags: ['beach', 'hang-gliding', 'paragliding', 'carnival', 'culture'],
    image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'New York City',
    country: 'United States',
    region: 'North America',
    cost_index: 5,
    popularity: 98,
    tags: ['city', 'broadway', 'shopping', 'museums', 'nightlife'],
    image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cusco',
    country: 'Peru',
    region: 'South America',
    cost_index: 2,
    popularity: 89,
    tags: ['history', 'hiking', 'machu-picchu', 'culture', 'mountains'],
    image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    cost_index: 3,
    popularity: 96,
    tags: ['temples', 'gardens', 'culture', 'history', 'food'],
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Banff',
    country: 'Canada',
    region: 'North America',
    cost_index: 4,
    popularity: 93,
    tags: ['lakes', 'skiing', 'hiking', 'mountains', 'wildlife'],
    image_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    cost_index: 4,
    popularity: 96,
    tags: ['island', 'sunset', 'beach', 'romance', 'view'],
    image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Asia',
    cost_index: 5,
    popularity: 95,
    tags: ['luxury', 'desert', 'shopping', 'skyscrapers', 'skydiving'],
    image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    cost_index: 1,
    popularity: 87,
    tags: ['pyramids', 'history', 'museums', 'culture', 'desert'],
    image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    cost_index: 4,
    popularity: 94,
    tags: ['harbor', 'beach', 'opera-house', 'surfing', 'city'],
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Chamonix',
    country: 'France',
    region: 'Europe',
    cost_index: 4,
    popularity: 91,
    tags: ['paragliding', 'skiing', 'mountains', 'hiking', 'climbing'],
    image_url: 'https://images.unsplash.com/photo-1548680373-ab6657731776?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Zermatt',
    country: 'Switzerland',
    region: 'Europe',
    cost_index: 5,
    popularity: 93,
    tags: ['skiing', 'matterhorn', 'mountains', 'hiking', 'luxury'],
    image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Oludeniz',
    country: 'Turkey',
    region: 'Europe',
    cost_index: 2,
    popularity: 89,
    tags: ['paragliding', 'beach', 'lagoon', 'scenery', 'water-sports'],
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
  }
];

async function initDb() {
  try {
    console.log('[DB Init] Checking schema and table configurations...');

    // 1. Check existing user_id column data type in trips table if it exists
    let userIdType = 'SERIAL';
    try {
      const columnCheck = await db.query(`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'trips' AND column_name = 'user_id';
      `);
      if (columnCheck.rows.length > 0) {
        const dt = columnCheck.rows[0].data_type.toLowerCase();
        if (dt.includes('uuid')) {
          userIdType = 'UUID';
        }
      }
    } catch (e) {
      console.log('[DB Init] Trips column check notice:', e.message);
    }

    console.log(`[DB Init] Using users.id data type: ${userIdType}`);

    // 2. Create users table
    const createUsersQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id ${userIdType === 'UUID' ? 'UUID PRIMARY KEY DEFAULT gen_random_uuid()' : 'SERIAL PRIMARY KEY'},
        username TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        city TEXT,
        country TEXT,
        additional_info TEXT,
        password_hash TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createUsersQuery);

    // Ensure all columns exist on users table if created earlier without them
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS additional_info TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`);
    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';`);

    // Ensure unique constraints on username and email
    try {
      await db.query(`ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);`);
    } catch (e) {}

    try {
      await db.query(`ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);`);
    } catch (e) {}

    // 3. Create cities table
    const createCitiesQuery = `
      CREATE TABLE IF NOT EXISTS cities (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL,
        region TEXT,
        cost_index SMALLINT DEFAULT 3,
        popularity SMALLINT DEFAULT 50,
        tags TEXT[],
        image_url TEXT
      );
    `;
    await db.query(createCitiesQuery);

    // Ensure all columns exist on cities table
    await db.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS region TEXT;`);
    await db.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS cost_index SMALLINT DEFAULT 3;`);
    await db.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS popularity SMALLINT DEFAULT 50;`);
    await db.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS tags TEXT[];`);
    await db.query(`ALTER TABLE cities ADD COLUMN IF NOT EXISTS image_url TEXT;`);

    try {
      await db.query(`ALTER TABLE cities ADD CONSTRAINT unique_city_country UNIQUE (name, country);`);
    } catch (e) {}

    // 4. Create trips table if not existing
    const createTripsQuery = `
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        user_id ${userIdType === 'UUID' ? 'UUID' : 'INT'} REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        start_date DATE,
        end_date DATE,
        description TEXT,
        cover_photo_url TEXT,
        budget_estimate NUMERIC,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createTripsQuery);

    // 5. Create trip_cities junction table
    const createTripCitiesQuery = `
      CREATE TABLE IF NOT EXISTS trip_cities (
        id SERIAL PRIMARY KEY,
        trip_id INT REFERENCES trips(id) ON DELETE CASCADE,
        city_id INT REFERENCES cities(id) ON DELETE CASCADE,
        sort_order SMALLINT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createTripCitiesQuery);

    // 6. Create trip_stops table
    const createTripStopsQuery = `
      CREATE TABLE IF NOT EXISTS trip_stops (
        id SERIAL PRIMARY KEY,
        trip_id INT REFERENCES trips(id) ON DELETE CASCADE,
        city_id INT REFERENCES cities(id) ON DELETE CASCADE,
        stop_order SMALLINT DEFAULT 0,
        arrival_date DATE,
        departure_date DATE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createTripStopsQuery);

    // 7. Create activities table
    const createActivitiesQuery = `
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        city_id INT REFERENCES cities(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT,
        estimated_cost NUMERIC,
        duration_hours NUMERIC,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createActivitiesQuery);

    // 8. Create trip_activities junction table
    const createTripActivitiesQuery = `
      CREATE TABLE IF NOT EXISTS trip_activities (
        id SERIAL PRIMARY KEY,
        trip_stop_id INT REFERENCES trip_stops(id) ON DELETE CASCADE,
        activity_id INT REFERENCES activities(id) ON DELETE CASCADE,
        scheduled_date DATE,
        scheduled_time TIME,
        actual_cost NUMERIC,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    await db.query(createTripActivitiesQuery);

    // 6. Seed cities safely
    for (const city of seedCities) {
      try {
        await db.query(
          `INSERT INTO cities (name, country, region, cost_index, popularity, tags, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING;`,
          [city.name, city.country, city.region, city.cost_index, city.popularity, city.tags, city.image_url]
        );
      } catch (e) {
        const existing = await db.query(
          `SELECT id FROM cities WHERE LOWER(name) = LOWER($1) AND LOWER(country) = LOWER($2);`,
          [city.name, city.country]
        );
        if (existing.rows.length === 0) {
          await db.query(
            `INSERT INTO cities (name, country, region, cost_index, popularity, tags, image_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [city.name, city.country, city.region, city.cost_index, city.popularity, city.tags, city.image_url]
          );
        }
      }
    }

    console.log('[DB Init] Database schema initialized and cities seeded successfully.');
  } catch (err) {
    console.error('[DB Init Error]:', err.message);
  }
}

module.exports = initDb;
