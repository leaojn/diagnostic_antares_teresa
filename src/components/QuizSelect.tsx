interface QuizSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
  hasError?: boolean;
}

const QuizSelect = ({ options, placeholder, hasError, className, ...props }: QuizSelectProps) => (
  <select
    className={`w-full px-4 py-2.5 rounded-lg bg-secondary text-foreground border transition-colors outline-none appearance-none cursor-pointer ${
      hasError ? "border-destructive" : "border-border focus:border-primary"
    } ${className ?? ""}`}
    {...props}
  >
    {placeholder && (
      <option value="" className="bg-secondary text-muted-foreground">
        {placeholder}
      </option>
    )}
    {options.map((o) => (
      <option key={o.value} value={o.value} className="bg-secondary">
        {o.label}
      </option>
    ))}
  </select>
);

export default QuizSelect;
