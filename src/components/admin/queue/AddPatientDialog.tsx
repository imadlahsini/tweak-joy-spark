import { useEffect, useId, useRef, useState } from "react";
import {
  X,
  AlertCircle,
  ChevronDown,
  Loader2,
  MessageSquarePlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { queueTypeLabel } from "@/lib/queue-constants";
import {
  formatMoroccanPhone,
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
} from "@/lib/moroccan-phone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PatientProfile, QueuePatient, QueueType } from "@/types/queue";

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultQueueType: QueueType;
  findPatientProfileByPhone: (phone: string) => Promise<PatientProfile | null>;
  onAdd: (data: {
    clientName: string;
    clientPhone: string;
    queueType: QueueType;
    notes?: string;
  }) => Promise<QueuePatient>;
}

const mapAddPatientError = (error: unknown): string => {
  const raw = (error as { message?: string })?.message?.toLowerCase() ?? "";

  if (
    raw.includes("schema cache") ||
    raw.includes("pgrst202") ||
    raw.includes("pgrst205") ||
    raw.includes("add_queue_patient_atomic") ||
    raw.includes("does not exist")
  ) {
    return "Queue system migration is incomplete (missing queue functions). Apply latest migrations and try again.";
  }

  if (
    raw.includes("failed to fetch") ||
    raw.includes("network") ||
    raw.includes("timeout")
  ) {
    return "Network issue while adding patient. Please check connection and try again.";
  }

  return "We couldn't add the patient right now. Please try again.";
};

const getPhoneErrorMessage = (value: string) => {
  if (!value.trim()) return "Phone number is required.";
  if (!isValidMoroccanPhone(value)) {
    return "Enter a valid Moroccan mobile number starting with 06 or 07.";
  }
  return null;
};

const AddPatientDialog = ({
  open,
  onOpenChange,
  defaultQueueType,
  findPatientProfileByPhone,
  onAdd,
}: AddPatientDialogProps) => {
  const isMobile = useIsMobile();
  const popupToneClass =
    defaultQueueType === "sans_rdv"
      ? "queue-add-popup--sans"
      : "queue-add-popup--rdv";
  const overlayToneClass = cn(
    "queue-add-popup-overlay",
    defaultQueueType === "sans_rdv"
      ? "queue-add-popup-overlay--sans"
      : "queue-add-popup-overlay--rdv",
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<PatientProfile | null>(null);
  const [isProfileLookupPending, setIsProfileLookupPending] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const notesInputRef = useRef<HTMLTextAreaElement | null>(null);
  const requestVersionRef = useRef(0);
  const profileLookupVersionRef = useRef(0);
  const lastAutofilledNameRef = useRef("");
  const idPrefix = useId();
  const nameInputId = `${idPrefix}-patient-name`;
  const phoneInputId = `${idPrefix}-patient-phone`;
  const notesInputId = `${idPrefix}-patient-notes`;
  const notesRegionId = `${idPrefix}-patient-notes-region`;
  const nameErrorId = `${idPrefix}-name-error`;
  const phoneErrorId = `${idPrefix}-phone-error`;
  const phoneHelpId = `${idPrefix}-phone-help`;
  const formErrorId = `${idPrefix}-form-error`;

  const resetForm = () => {
    setName("");
    setPhone("");
    setNotes("");
    setNotesExpanded(false);
    setFormError(null);
    setSubmitAttempted(false);
    setNameTouched(false);
    setPhoneTouched(false);
    setPhoneFocused(false);
    setMatchedProfile(null);
    setIsProfileLookupPending(false);
    setDiscardConfirmOpen(false);
    lastAutofilledNameRef.current = "";
  };

  useEffect(() => {
    if (!open || isMobile) return;
    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 25);
    return () => window.clearTimeout(timer);
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !notesExpanded) return;
    const timer = window.setTimeout(() => {
      notesInputRef.current?.focus();
    }, 20);
    return () => window.clearTimeout(timer);
  }, [open, notesExpanded]);

  useEffect(() => {
    if (!open) {
      setDiscardConfirmOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const normalizedPhone = normalizeMoroccanPhone(phone);
    if (!isValidMoroccanPhone(normalizedPhone)) {
      profileLookupVersionRef.current += 1;
      setMatchedProfile(null);
      setIsProfileLookupPending(false);
      return;
    }

    const lookupVersion = profileLookupVersionRef.current + 1;
    profileLookupVersionRef.current = lookupVersion;
    setIsProfileLookupPending(true);

    const timer = window.setTimeout(async () => {
      try {
        const profile = await findPatientProfileByPhone(normalizedPhone);
        if (profileLookupVersionRef.current !== lookupVersion) return;

        setMatchedProfile(profile);

        if (profile?.name?.trim()) {
          setName((currentName) => {
            const trimmedCurrentName = currentName.trim();
            const previousAutofill = lastAutofilledNameRef.current.trim();
            const nextAutofill = profile.name.trim();
            const canAutofill =
              trimmedCurrentName === "" || trimmedCurrentName === previousAutofill;

            if (!canAutofill) {
              return currentName;
            }

            lastAutofilledNameRef.current = nextAutofill;
            return nextAutofill;
          });
        }
      } catch (error) {
        console.error("Patient profile lookup failed", error);
        if (profileLookupVersionRef.current !== lookupVersion) return;
        setMatchedProfile(null);
      } finally {
        if (profileLookupVersionRef.current === lookupVersion) {
          setIsProfileLookupPending(false);
        }
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [findPatientProfileByPhone, open, phone]);

  const isDirty = Boolean(name.trim() || phone.trim() || notes.trim());
  const showNameError = submitAttempted || nameTouched;
  const showPhoneError = submitAttempted || phoneTouched;
  const activeNameError = showNameError && !name.trim() ? "Patient name is required." : null;
  const activePhoneError = showPhoneError ? getPhoneErrorMessage(phone) : null;
  const profileHint = isProfileLookupPending
    ? "Looking up saved patient profile..."
    : matchedProfile
      ? name.trim() === matchedProfile.name.trim()
        ? "Existing profile found. Name auto-filled from the saved profile."
        : `Profile found: ${matchedProfile.name}`
      : null;
  const nameDescribedBy = [activeNameError ? nameErrorId : null]
    .filter(Boolean)
    .join(" ");
  const phoneDescribedBy = [profileHint ? phoneHelpId : null, activePhoneError ? phoneErrorId : null]
    .filter(Boolean)
    .join(" ");

  const closeImmediately = () => {
    requestVersionRef.current += 1;
    setIsSaving(false);
    resetForm();
    onOpenChange(false);
  };

  const requestClose = () => {
    if (isSaving) {
      closeImmediately();
      return;
    }

    if (isDirty) {
      setDiscardConfirmOpen(true);
      return;
    }

    closeImmediately();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    requestClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setNameTouched(true);
    setPhoneTouched(true);

    const phoneError = getPhoneErrorMessage(phone);
    if (!name.trim() || phoneError) {
      if (!name.trim()) {
        nameInputRef.current?.focus();
      } else {
        phoneInputRef.current?.focus();
      }
      return;
    }

    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;

    setIsSaving(true);
    setFormError(null);
    try {
      const addedPatient = await onAdd({
        clientName: name.trim(),
        clientPhone: normalizeMoroccanPhone(phone),
        queueType: defaultQueueType,
        notes: notes.trim() || undefined,
      });

      const queueLabel = queueTypeLabel[addedPatient.queueType] ?? "queue";
      toast.success(`Added to ${queueLabel} queue`);

      if (requestVersionRef.current === requestVersion) {
        closeImmediately();
      }
    } catch (err) {
      console.error("Add patient failed", err);
      const userMsg = mapAddPatientError(err);

      if (requestVersionRef.current === requestVersion) {
        setFormError(userMsg);
      } else {
        toast.error(userMsg);
      }
    } finally {
      if (requestVersionRef.current === requestVersion) {
        setIsSaving(false);
      }
    }
  };

  const formFields = (
    <div className="queue-add-popup-fields">
      <div className="queue-add-popup-field">
        <Label htmlFor={nameInputId} className="queue-add-popup-label">
          Patient Name <span className="text-rose-500">*</span>
        </Label>
        <Input
          id={nameInputId}
          ref={nameInputRef}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setFormError(null);
          }}
          onBlur={() => setNameTouched(true)}
          placeholder="Full name"
          className={cn(
            "queue-add-popup-control h-11 rounded-[12px] px-3.5 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            activeNameError && "queue-add-popup-control-invalid",
          )}
          autoComplete="name"
          aria-invalid={Boolean(activeNameError)}
          aria-describedby={nameDescribedBy || undefined}
          required
        />
        {activeNameError && (
          <p id={nameErrorId} role="alert" className="queue-add-popup-field-error">
            {activeNameError}
          </p>
        )}
      </div>

      <div className="queue-add-popup-field">
        <Label htmlFor={phoneInputId} className="queue-add-popup-label">
          Phone <span className="text-rose-500">*</span>
        </Label>
        <Input
          id={phoneInputId}
          ref={phoneInputRef}
          value={phoneFocused ? phone : formatMoroccanPhone(phone)}
          onChange={(e) => {
            setPhone(normalizeMoroccanPhone(e.target.value));
            setFormError(null);
          }}
          onFocus={() => setPhoneFocused(true)}
          onBlur={() => {
            setPhoneTouched(true);
            setPhoneFocused(false);
          }}
          placeholder="06 00 00 00 00"
          className={cn(
            "queue-add-popup-control h-11 rounded-[12px] px-3.5 text-[15px] font-mono shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
            activePhoneError && "queue-add-popup-control-invalid",
          )}
          inputMode="tel"
          autoComplete="tel-national"
          enterKeyHint={notesExpanded ? "next" : "done"}
          aria-invalid={Boolean(activePhoneError)}
          aria-describedby={phoneDescribedBy || undefined}
          required
        />
        {profileHint && (
          <p id={phoneHelpId} className="queue-add-popup-help queue-add-popup-profile-hint">
            {profileHint}
          </p>
        )}
        {activePhoneError && (
          <p id={phoneErrorId} role="alert" className="queue-add-popup-field-error">
            {activePhoneError}
          </p>
        )}
      </div>

      <div className="queue-add-popup-field">
        <button
          type="button"
          onClick={() => setNotesExpanded((current) => !current)}
          aria-expanded={notesExpanded}
          aria-controls={notesRegionId}
          className={cn(
            "queue-add-popup-note-toggle",
            notesExpanded && "queue-add-popup-note-toggle-expanded",
          )}
        >
          <span className="queue-add-popup-note-toggle-copy">
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{notesExpanded ? "Hide note" : "Add note"}</span>
          </span>
          <ChevronDown className="queue-add-popup-note-toggle-chevron h-3.5 w-3.5" />
        </button>

        {notesExpanded && (
          <div
            id={notesRegionId}
            className="queue-add-popup-field queue-add-popup-notes-block"
          >
            <Label htmlFor={notesInputId} className="queue-add-popup-label">
              Notes (Optional)
            </Label>
            <Textarea
              id={notesInputId}
              ref={notesInputRef}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g., urgent, follow-up, referred by..."
              className="queue-add-popup-control min-h-[92px] resize-none rounded-[12px] px-3.5 py-3 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        )}
      </div>

      {formError && (
        <div id={formErrorId} role="alert" className="queue-add-popup-alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{formError}</p>
        </div>
      )}
    </div>
  );

  const actionButton = (
    <button
      type="submit"
      disabled={isSaving}
      className="queue-add-popup-action queue-add-popup-action-primary queue-add-popup-action-full"
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        "Add Patient"
      )}
    </button>
  );

  const mobileForm = (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="queue-add-popup-mobile-utility px-4 pt-3 sm:px-5">
        <button
          type="button"
          onClick={requestClose}
          className="queue-add-popup-close queue-add-popup-close-mobile"
          aria-label="Close add patient popup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="queue-add-popup-scroll queue-add-popup-scroll-mobile px-4 pb-4 pt-2 sm:px-5">
        {formFields}
      </div>
      <div className="queue-add-popup-footer queue-add-popup-footer-mobile px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-[14px] sm:px-5">
        {actionButton}
      </div>
    </form>
  );

  const desktopForm = (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="queue-add-popup-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-5 sm:px-5">
        {formFields}
      </div>
      <div className="queue-add-popup-footer px-4 pb-5 pt-[14px] sm:px-5">
        {actionButton}
      </div>
    </form>
  );

  const srOnlyTitle = isMobile ? (
    <DrawerTitle className="sr-only">Add Patient</DrawerTitle>
  ) : (
    <DialogTitle className="sr-only">Add Patient</DialogTitle>
  );

  const closeButton = (
    <button
      type="button"
      onClick={requestClose}
      className="queue-add-popup-close"
      aria-label="Close add patient popup"
    >
      <X className="h-4 w-4" />
    </button>
  );

  const discardDialog = (
    <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
      <AlertDialogContent className="queue-add-popup-discard-dialog">
        <AlertDialogHeader className="queue-add-popup-discard-header">
          <AlertDialogTitle className="queue-add-popup-discard-title">
            Discard this patient draft?
          </AlertDialogTitle>
          <AlertDialogDescription className="queue-add-popup-discard-description">
            Your typed patient details will be lost if you close now.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="queue-add-popup-discard-footer">
          <AlertDialogCancel className="queue-add-popup-discard-action queue-add-popup-discard-cancel">
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={closeImmediately}
            className="queue-add-popup-discard-action queue-add-popup-discard-confirm"
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange} dismissible={false}>
          <DrawerContent
            overlayClassName={overlayToneClass}
            className={`!fixed queue-add-popup ${popupToneClass} queue-add-popup-surface queue-add-popup-drawer max-h-[min(92dvh,720px)] !overflow-hidden rounded-t-[18px] border-0 bg-transparent p-0`}
          >
            {srOnlyTitle}
            {mobileForm}
          </DrawerContent>
        </Drawer>
        {discardDialog}
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          overlayClassName={overlayToneClass}
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className={`!fixed queue-add-popup ${popupToneClass} queue-add-popup-surface queue-add-popup-dialog flex min-h-0 max-h-[min(92dvh,690px)] flex-col gap-0 overflow-hidden rounded-[30px] border-0 p-0 sm:max-w-[448px]`}
        >
          {srOnlyTitle}
          {closeButton}
          {desktopForm}
        </DialogContent>
      </Dialog>
      {discardDialog}
    </>
  );
};

export default AddPatientDialog;
