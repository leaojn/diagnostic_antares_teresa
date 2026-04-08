interface QuizFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const QuizField = ({ label, required, error, children }: QuizFieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-primary ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default QuizField;
