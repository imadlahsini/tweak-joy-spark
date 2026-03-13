import { motion, AnimatePresence } from "framer-motion";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Check, User, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  name: string;
  email: string;
  company?: string;
}

interface CheckoutFormProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  dirtyFields: Partial<Record<keyof FormData, boolean>>;
  isValid: boolean;
}

const FloatingField = ({
  id,
  label,
  icon: Icon,
  placeholder,
  type = "text",
  required = false,
  register,
  error,
  isDirty,
  isValidField,
}: {
  id: keyof FormData;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FormData>;
  error?: string;
  isDirty?: boolean;
  isValidField: boolean;
}) => (
  <div className="space-y-2 relative">
    <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      {label}
      {!required && <span className="text-muted-foreground text-xs">(optional)</span>}
      {isDirty && isValidField && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          <Check className="w-3.5 h-3.5 text-green-500" />
        </motion.div>
      )}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      {...register(id)}
      className={`h-11 bg-background/50 border-border/60 transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
        error ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_hsl(var(--destructive)/0.1)]" : ""
      }`}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const CheckoutForm = ({ register, errors, dirtyFields, isValid }: CheckoutFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-soft"
    >
      <h2 className="text-lg font-display font-semibold text-foreground mb-5">Your information</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <FloatingField
          id="name"
          label="Full Name"
          icon={User}
          placeholder="John Doe"
          required
          register={register}
          error={errors.name?.message}
          isDirty={dirtyFields.name}
          isValidField={!!dirtyFields.name && !errors.name}
        />
        <FloatingField
          id="email"
          label="Email"
          icon={Mail}
          placeholder="john@company.com"
          type="email"
          required
          register={register}
          error={errors.email?.message}
          isDirty={dirtyFields.email}
          isValidField={!!dirtyFields.email && !errors.email}
        />
      </div>
    </motion.div>
  );
};

export default CheckoutForm;
