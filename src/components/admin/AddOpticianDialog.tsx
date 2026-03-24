import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, Loader2, UserRoundPlus, X } from "lucide-react";
import { toast } from "sonner";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  formatMoroccanPhone,
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
} from "@/lib/moroccan-phone";
import { cn } from "@/lib/utils";
import type { Optician } from "@/types/queue";

interface AddOpticianDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opticians: Optician[];
  onAdd: (data: {
    name: string;
    phone: string;
    address: string;
    mapLink: string;
  }) => Promise<void>;
}

const normalizeOpticianName = (value: string) => value.trim().replace(/\s+/g, " ");
const canonicalOpticianName = (value: string) =>
  normalizeOpticianName(value).toLocaleLowerCase();
const normalizeRequiredField = (value: string) => value.trim().replace(/\s+/g, " ");
const normalizeMapLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
const isValidGoogleMapsUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLocaleLowerCase();
    const pathname = parsed.pathname.toLocaleLowerCase();
    const isGoogleMapsDomain =
      /(^|\.)google\.[a-z.]+$/.test(hostname) &&
      (hostname.startsWith("maps.") || pathname.startsWith("/maps"));
    const isGoogleMapsShortLink =
      hostname === "maps.app.goo.gl" || (hostname === "goo.gl" && pathname.startsWith("/maps"));

    return isGoogleMapsDomain || isGoogleMapsShortLink;
  } catch {
    return false;
  }
};

const DUPLICATE_OPTICIAN_MESSAGE = "This optician already exists.";
const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "Failed to add optician";

type AddOpticianField = "name" | "phone" | "address" | "mapLink";
type FieldErrors = Record<AddOpticianField, string | null>;

const EMPTY_FIELD_ERRORS: FieldErrors = {
  name: null,
  phone: null,
  address: null,
  mapLink: null,
};

const isDuplicateOpticianError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === "23505" ||
    maybeError.message?.toLocaleLowerCase().includes("duplicate key") === true ||
    maybeError.message?.includes("opticians_name_canonical_unique_idx") === true
  );
};

const getNameError = (value: string, opticians: Optician[]) => {
  const normalizedName = normalizeOpticianName(value);

  if (!normalizedName) {
    return "Enter the optician name.";
  }

  const hasDuplicate = opticians.some(
    (optician) => canonicalOpticianName(optician.name) === canonicalOpticianName(normalizedName),
  );

  return hasDuplicate ? DUPLICATE_OPTICIAN_MESSAGE : null;
};

const getPhoneError = (value: string) => {
  if (!value.trim()) {
    return "Enter the optician phone number.";
  }

  if (!isValidMoroccanPhone(value)) {
    return "Enter a valid Moroccan number starting with 06 or 07.";
  }

  return null;
};

const getAddressError = (value: string) =>
  normalizeRequiredField(value) ? null : "Enter the optician address.";

const getMapLinkError = (value: string) => {
  const normalizedGoogleMapLink = normalizeMapLink(value);

  if (!normalizedGoogleMapLink) {
    return "Enter the Google Maps link.";
  }

  if (!isValidGoogleMapsUrl(normalizedGoogleMapLink)) {
    return "Enter a valid Google Maps link from Google Maps.";
  }

  return null;
};

const AddOpticianDialog = ({ open, onOpenChange, opticians, onAdd }: AddOpticianDialogProps) => {
  const isMobile = useIsMobile();
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    address: "",
    mapLink: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(EMPTY_FIELD_ERRORS);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const mapLinkInputRef = useRef<HTMLInputElement | null>(null);
  const idPrefix = useId();
  const isDirty = Object.values(formValues).some((value) => value.trim().length > 0);
  const nameErrorId = `${idPrefix}-optician-name-error`;
  const phoneErrorId = `${idPrefix}-optician-phone-error`;
  const phoneHelperId = `${idPrefix}-optician-phone-help`;
  const addressErrorId = `${idPrefix}-optician-address-error`;
  const mapLinkErrorId = `${idPrefix}-optician-map-link-error`;
  const requestErrorId = `${idPrefix}-optician-request-error`;

  const resetForm = () => {
    setFormValues({
      name: "",
      phone: "",
      address: "",
      mapLink: "",
    });
    setFieldErrors(EMPTY_FIELD_ERRORS);
    setRequestError(null);
    setIsSubmitting(false);
    setDiscardConfirmOpen(false);
    setSubmitAttempted(false);
    setPhoneFocused(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if (isMobile) return;

    const timer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 25);

    return () => window.clearTimeout(timer);
  }, [open, isMobile]);

  const closeImmediately = () => {
    setDiscardConfirmOpen(false);
    onOpenChange(false);
  };

  const requestClose = () => {
    if (isSubmitting) return;

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

  const focusField = (field: AddOpticianField) => {
    if (field === "name") {
      nameInputRef.current?.focus();
      return;
    }

    if (field === "phone") {
      phoneInputRef.current?.focus();
      return;
    }

    if (field === "address") {
      addressInputRef.current?.focus();
      return;
    }

    mapLinkInputRef.current?.focus();
  };

  const validateField = (
    field: AddOpticianField,
    values: typeof formValues,
    availableOpticians: Optician[],
  ) => {
    if (field === "name") return getNameError(values.name, availableOpticians);
    if (field === "phone") return getPhoneError(values.phone);
    if (field === "address") return getAddressError(values.address);
    return getMapLinkError(values.mapLink);
  };

  const validateAllFields = (
    values: typeof formValues,
    availableOpticians: Optician[],
  ): FieldErrors => ({
    name: getNameError(values.name, availableOpticians),
    phone: getPhoneError(values.phone),
    address: getAddressError(values.address),
    mapLink: getMapLinkError(values.mapLink),
  });

  const getFirstInvalidField = (errors: FieldErrors): AddOpticianField | null => {
    if (errors.name) return "name";
    if (errors.phone) return "phone";
    if (errors.address) return "address";
    if (errors.mapLink) return "mapLink";
    return null;
  };

  const updateField = (field: AddOpticianField, value: string) => {
    setFormValues((current) => {
      const nextValues = { ...current, [field]: value };

      if (submitAttempted) {
        setFieldErrors((currentErrors) => ({
          ...currentErrors,
          [field]: validateField(field, nextValues, opticians),
        }));
      }

      return nextValues;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setRequestError(null);

    const nextFieldErrors = validateAllFields(formValues, opticians);
    setFieldErrors(nextFieldErrors);

    const firstInvalidField = getFirstInvalidField(nextFieldErrors);
    if (firstInvalidField) {
      focusField(firstInvalidField);
      return;
    }

    const normalizedName = normalizeOpticianName(formValues.name);
    const normalizedPhone = normalizeMoroccanPhone(formValues.phone);
    const normalizedAddress = normalizeRequiredField(formValues.address);
    const normalizedGoogleMapLink = normalizeMapLink(formValues.mapLink);

    setIsSubmitting(true);

    try {
      await onAdd({
        name: normalizedName,
        phone: normalizedPhone,
        address: normalizedAddress,
        mapLink: normalizedGoogleMapLink,
      });
      toast.success(`${normalizedName} added to the optician roster`);
      closeImmediately();
    } catch (error) {
      if (isDuplicateOpticianError(error)) {
        setFieldErrors((current) => ({
          ...current,
          name: DUPLICATE_OPTICIAN_MESSAGE,
        }));
        focusField("name");
      } else {
        setRequestError(getErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerContent = (
    <div
      className={cn(
        "settings-add-popup-header",
        isMobile && "settings-add-popup-header-mobile",
      )}
    >
      <p className="settings-eyebrow">Opticians</p>
      <h2 className="settings-add-popup-title">Add Optician</h2>
      <p className="settings-add-popup-copy">
        Add the optician&apos;s contact details and Google Maps link so they are ready for Queue
        assignments immediately.
      </p>
    </div>
  );

  const formFields = (
    <div className="settings-form settings-add-popup-fields">
      <div className="settings-form-grid settings-add-popup-grid">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-optician-name`} className="settings-field-label">
            Optician name <span className="settings-add-popup-required">*</span>
          </Label>
          <Input
            id={`${idPrefix}-optician-name`}
            ref={nameInputRef}
            value={formValues.name}
            onChange={(event) => {
              updateField("name", event.target.value);
            }}
            placeholder="Add an optician"
            autoComplete="name"
            required
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? nameErrorId : undefined}
            className={cn(
              "admin-control settings-input settings-add-popup-control",
              fieldErrors.name && "settings-add-popup-control-invalid",
            )}
          />
          {fieldErrors.name && (
            <p id={nameErrorId} role="alert" className="settings-add-popup-field-error">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-optician-phone`} className="settings-field-label">
            Phone number <span className="settings-add-popup-required">*</span>
          </Label>
          <Input
            id={`${idPrefix}-optician-phone`}
            ref={phoneInputRef}
            value={phoneFocused ? formValues.phone : formatMoroccanPhone(formValues.phone)}
            onChange={(event) => {
              updateField("phone", normalizeMoroccanPhone(event.target.value));
            }}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            placeholder="06 00 00 00 00"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={[
              phoneHelperId,
              fieldErrors.phone ? phoneErrorId : null,
            ]
              .filter(Boolean)
              .join(" ")}
            className={cn(
              "admin-control settings-input settings-add-popup-control settings-add-popup-control-mono",
              fieldErrors.phone && "settings-add-popup-control-invalid",
            )}
          />
          {fieldErrors.phone ? (
            <p id={phoneErrorId} role="alert" className="settings-add-popup-field-error">
              {fieldErrors.phone}
            </p>
          ) : (
            <p id={phoneHelperId} className="settings-add-popup-field-helper">
              Use a Moroccan number starting with 06 or 07.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-optician-address`} className="settings-field-label">
            Address <span className="settings-add-popup-required">*</span>
          </Label>
          <Input
            id={`${idPrefix}-optician-address`}
            ref={addressInputRef}
            value={formValues.address}
            onChange={(event) => {
              updateField("address", event.target.value);
            }}
            placeholder="Address"
            autoComplete="street-address"
            required
            aria-invalid={Boolean(fieldErrors.address)}
            aria-describedby={fieldErrors.address ? addressErrorId : undefined}
            className={cn(
              "admin-control settings-input settings-add-popup-control",
              fieldErrors.address && "settings-add-popup-control-invalid",
            )}
          />
          {fieldErrors.address && (
            <p id={addressErrorId} role="alert" className="settings-add-popup-field-error">
              {fieldErrors.address}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-optician-map-link`} className="settings-field-label">
            Google Maps link <span className="settings-add-popup-required">*</span>
          </Label>
          <Input
            id={`${idPrefix}-optician-map-link`}
            ref={mapLinkInputRef}
            value={formValues.mapLink}
            onChange={(event) => {
              updateField("mapLink", event.target.value);
            }}
            placeholder="https://maps.google.com/..."
            autoComplete="url"
            inputMode="url"
            required
            aria-invalid={Boolean(fieldErrors.mapLink)}
            aria-describedby={fieldErrors.mapLink ? mapLinkErrorId : undefined}
            className={cn(
              "admin-control settings-input settings-add-popup-control",
              fieldErrors.mapLink && "settings-add-popup-control-invalid",
            )}
          />
          {fieldErrors.mapLink && (
            <p id={mapLinkErrorId} role="alert" className="settings-add-popup-field-error">
              {fieldErrors.mapLink}
            </p>
          )}
        </div>
      </div>

      {requestError && (
        <div id={requestErrorId} role="alert" className="settings-add-popup-request-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{requestError}</p>
        </div>
      )}
    </div>
  );

  const actionButton = (
    <button
      type="submit"
      disabled={isSubmitting}
      className="settings-add-popup-submit"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <UserRoundPlus className="h-4 w-4" />
          Add Optician
        </>
      )}
    </button>
  );

  const srOnlyTitle = isMobile ? (
    <DrawerTitle className="sr-only">Add Optician</DrawerTitle>
  ) : (
    <DialogTitle className="sr-only">Add Optician</DialogTitle>
  );

  const renderCloseButton = (className?: string) => (
    <button
      type="button"
      onClick={requestClose}
      className={cn("settings-add-popup-close", className)}
      aria-label="Close add optician popup"
      disabled={isSubmitting}
    >
      <X className="h-4 w-4" />
    </button>
  );

  const mobileForm = (
    <form onSubmit={handleSubmit} className="settings-add-popup-form">
      <div className="settings-add-popup-mobile-utility">
        {renderCloseButton("settings-add-popup-close-mobile")}
      </div>
      <div className="settings-add-popup-scroll settings-add-popup-scroll-mobile">
        {headerContent}
        {formFields}
      </div>
      <div className="settings-add-popup-footer settings-add-popup-footer-mobile">
        {actionButton}
      </div>
    </form>
  );

  const desktopForm = (
    <form onSubmit={handleSubmit} className="settings-add-popup-form">
      <div className="settings-add-popup-scroll settings-add-popup-scroll-desktop">
        {headerContent}
        {formFields}
      </div>
      <div className="settings-add-popup-footer settings-add-popup-footer-desktop">
        {actionButton}
      </div>
    </form>
  );

  const discardDialog = (
    <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
      <AlertDialogContent className="settings-add-popup-discard-dialog">
        <AlertDialogHeader className="settings-add-popup-discard-header">
          <AlertDialogTitle className="settings-add-popup-discard-title">
            Discard this optician draft?
          </AlertDialogTitle>
          <AlertDialogDescription className="settings-add-popup-discard-description">
            Your typed optician details will be lost if you close now.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="settings-add-popup-discard-footer">
          <AlertDialogCancel className="settings-add-popup-discard-action settings-add-popup-discard-cancel">
            Keep editing
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={closeImmediately}
            className="settings-add-popup-discard-action settings-add-popup-discard-confirm"
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
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent
            overlayClassName="settings-add-popup-overlay"
            className="!fixed settings-add-popup settings-add-popup-surface settings-add-popup-drawer max-h-[min(92dvh,720px)] !overflow-hidden rounded-t-[22px] border-0 bg-transparent p-0"
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
          overlayClassName="settings-add-popup-overlay"
          className={cn(
            "!fixed settings-add-popup settings-add-popup-surface settings-add-popup-dialog flex min-h-0 max-h-[min(90dvh,680px)] flex-col gap-0 overflow-hidden rounded-[24px] border-0 p-0 sm:max-w-[560px]",
          )}
        >
          {srOnlyTitle}
          {renderCloseButton()}
          {desktopForm}
        </DialogContent>
      </Dialog>
      {discardDialog}
    </>
  );
};

export default AddOpticianDialog;
