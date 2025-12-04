// lib/languageMappings.ts

export const mapLanguageToMonaco = (language: string | undefined | null): string => {
  if (!language) return "plaintext";

  const formatted = language.toLowerCase();

  switch (formatted) {
    case "c++":
    case "cpp":
      return "cpp"; // Monaco requires "cpp"
    case "java":
      return "java";
    case "python":
    case "python3":
    case "py":
      return "python";
    case "javascript":
    case "js":
    case "node":
      return "javascript";
    case "typescript":
    case "ts":
      return "typescript";
    case "c":
      return "c";
    case "c#":
    case "csharp":
      return "csharp";
    case "go":
    case "golang":
      return "go";
    case "rust":
      return "rust";
    default:
      return "plaintext"; // Fallback if unknown
  }
};