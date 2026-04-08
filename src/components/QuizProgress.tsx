import { motion } from "framer-motion";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

// Non-linear progress: fills faster at the start, slower at the end
const getProgress = (step: number, total: number) => {
  const weights = [30, 25, 22, 15, 8];
  let progress = 0;
  for (let i = 0; i <= step; i++) progress += weights[i] ?? 0;
  return Math.min(progress, 100);
};

const QuizProgress = ({ currentStep, totalSteps }: QuizProgressProps) => {
  const progress = getProgress(currentStep, totalSteps);

  return (
    <div className="w-full mb-8">
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;
