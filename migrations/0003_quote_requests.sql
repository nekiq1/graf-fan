CREATE TABLE IF NOT EXISTS quote_requests (
  id text PRIMARY KEY,
  service_id text NOT NULL,
  service_name text NOT NULL,
  category text NOT NULL,
  car_model text NOT NULL,
  car_class_label text NOT NULL,
  selected_options jsonb NOT NULL DEFAULT '[]'::jsonb,
  estimated_price integer NOT NULL DEFAULT 0,
  client_name text NOT NULL,
  contact_value text NOT NULL,
  contact_method text NOT NULL,
  comment text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'новая',
  consent_personal_data boolean NOT NULL DEFAULT true,
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_version text NOT NULL,
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at
  ON quote_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS admin_credentials (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  username text NOT NULL,
  salt_hex text NOT NULL,
  hash_hex text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
