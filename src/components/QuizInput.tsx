interface QuizInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const QuizInput = ({ hasError, className, ...props }: QuizInputProps) => (
  <input
    className={`w-full px-4 py-2.5 rounded-lg bg-secondary text-foreground border transition-colors outline-none placeholder:text-muted-foreground ${
      hasError ? "border-destructive" : "border-border focus:border-primary"
    } ${className ?? ""}`}
    {...props}
  />
);

export default QuizInput;
