-- Run once with a migration owner on an approved PostgreSQL database.
BEGIN;
CREATE TABLE businesses (
  id uuid PRIMARY KEY, slug text NOT NULL UNIQUE CHECK (slug <> 'demo'), name text NOT NULL,
  timezone text NOT NULL, postal_codes text[] NOT NULL, booking_enabled boolean NOT NULL DEFAULT false,
  phone_number text UNIQUE, forward_number text, sms_enabled boolean NOT NULL DEFAULT false,
  routing_verified boolean NOT NULL DEFAULT false, consent_notice text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE services (
  business_id uuid NOT NULL REFERENCES businesses(id), id uuid NOT NULL, name text NOT NULL,
  duration_minutes integer NOT NULL CHECK(duration_minutes BETWEEN 15 AND 480), active boolean NOT NULL DEFAULT true,
  PRIMARY KEY (business_id,id)
);
CREATE TABLE resources (
  business_id uuid NOT NULL REFERENCES businesses(id), id uuid NOT NULL, name text NOT NULL,
  PRIMARY KEY (business_id,id)
);
CREATE TABLE availability (
  business_id uuid NOT NULL, id uuid NOT NULL, resource_id uuid NOT NULL,
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  PRIMARY KEY (business_id,id), FOREIGN KEY (business_id,resource_id) REFERENCES resources(business_id,id),
  CHECK(ends_at > starts_at AND ends_at <= starts_at + interval '24 hours')
);
CREATE INDEX availability_lookup ON availability(business_id,starts_at);
CREATE TABLE bookings (
  business_id uuid NOT NULL REFERENCES businesses(id), id uuid NOT NULL, service_id uuid NOT NULL,
  resource_id uuid NOT NULL, starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  customer_name text NOT NULL, phone text NOT NULL, address text NOT NULL, postal_code text NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK(status IN ('confirmed','cancelled')),
  idempotency_key uuid NOT NULL, request_hash text NOT NULL, token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), cancelled_at timestamptz,
  PRIMARY KEY (business_id,id), UNIQUE(business_id,idempotency_key), UNIQUE(token_hash),
  FOREIGN KEY(business_id,service_id) REFERENCES services(business_id,id),
  FOREIGN KEY(business_id,resource_id) REFERENCES resources(business_id,id), CHECK(ends_at>starts_at)
);
CREATE INDEX booking_conflicts ON bookings(business_id,resource_id,starts_at) WHERE status='confirmed';
-- Database guard prevents overlaps even when two independent application instances write.
-- Every booking/config transaction locks its business first, then subordinate records.
CREATE FUNCTION guard_booking_overlap() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM id FROM businesses WHERE id=NEW.business_id FOR UPDATE;
  IF NEW.status='confirmed' AND EXISTS(SELECT 1 FROM bookings b WHERE b.business_id=NEW.business_id
    AND b.resource_id=NEW.resource_id AND b.id<>NEW.id AND b.status='confirmed'
    AND b.starts_at<NEW.ends_at AND b.ends_at>NEW.starts_at) THEN
    RAISE EXCEPTION 'service window no longer available' USING ERRCODE='23P01';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER booking_overlap BEFORE INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION guard_booking_overlap();
CREATE TABLE rate_limits (key text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL);
CREATE TABLE sms_contacts (
  business_id uuid NOT NULL REFERENCES businesses(id), phone text NOT NULL, consent_at timestamptz,
  consent_source text, opted_out boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(business_id,phone)
);
CREATE TABLE voice_calls (
  call_sid text PRIMARY KEY, business_id uuid NOT NULL REFERENCES businesses(id), caller text NOT NULL,
  consent boolean NOT NULL DEFAULT false, status text NOT NULL DEFAULT 'inbound', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sms_outbox (
  id uuid PRIMARY KEY, business_id uuid NOT NULL REFERENCES businesses(id), call_sid text NOT NULL UNIQUE REFERENCES voice_calls(call_sid),
  phone text NOT NULL, state text NOT NULL CHECK(state IN ('pending','sending','accepted','delivered','failed','unknown','suppressed')),
  provider_sid text UNIQUE, error_code text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE webhook_events (key text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
COMMIT;
