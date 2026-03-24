GRANT EXECUTE ON FUNCTION
  public.add_queue_patient_atomic(date, text, text, text, text),
  public.move_queue_patient_to_medecin_atomic(uuid),
  public.update_reservation_status_atomic(uuid, text)
TO authenticated, service_role;
