-- ============================================================
-- Queue Management System
-- ============================================================

-- Opticians table
CREATE TABLE IF NOT EXISTS opticians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE opticians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view opticians"
  ON opticians FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert opticians"
  ON opticians FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update opticians"
  ON opticians FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete opticians"
  ON opticians FOR DELETE
  TO authenticated
  USING (true);

-- Queue patients table
CREATE TABLE IF NOT EXISTS queue_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Africa/Casablanca'),
  queue_type TEXT NOT NULL CHECK (queue_type IN ('rdv', 'sans_rdv')),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'with_medecin', 'completed', 'no_show', 'cancelled')),
  notes TEXT,
  procedure TEXT,
  procedure_at TIMESTAMPTZ,
  follow_up TEXT,
  optician_id UUID REFERENCES opticians(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  with_doctor_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  no_show_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast daily queries
CREATE INDEX idx_queue_patients_date_status
  ON queue_patients (queue_date, status);

CREATE INDEX idx_queue_patients_date_type_status_pos
  ON queue_patients (queue_date, queue_type, status, position);

-- RLS
ALTER TABLE queue_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view queue patients"
  ON queue_patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert queue patients"
  ON queue_patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update queue patients"
  ON queue_patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete queue patients"
  ON queue_patients FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_queue_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_queue_patients_updated_at
  BEFORE UPDATE ON queue_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_patients_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE queue_patients;
