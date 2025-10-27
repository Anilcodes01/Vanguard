import { Check } from "lucide-react";

export const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { num: 1, title: "Identity" },
    { num: 2, title: "Arsenal" },
    { num: 3, title: "Quest" },
    { num: 4, title: "Style" },
  ];

  return (
    <div className="flex w-full max-w-lg mx-auto items-start justify-between relative">
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-700"></div>=
      <div
        className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-500"
        style={{
          width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${
            currentStep === 1 || currentStep === steps.length
              ? "1.25rem"
              : "0rem"
          })`,
        }}
      ></div>
      {steps.map((step) => (
        <div key={step.num} className="z-10 flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              currentStep >= step.num ? "bg-green-500" : "bg-slate-700"
            }`}
          >
            {currentStep > step.num ? (
              <Check className="text-white" />
            ) : (
              <span className="text-white font-bold text-lg">{step.num}</span>
            )}
          </div>
          <span
            className={`mt-2 text-xs font-semibold transition-colors duration-500 ${
              currentStep >= step.num ? "text-white" : "text-slate-400"
            }`}
          >
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
};
