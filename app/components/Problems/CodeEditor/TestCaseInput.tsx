export const TestCaseInput = ({ input }: { input: string | null }) => {
  if (!input)
    return <div className="p-4 text-gray-500">No input for this test case.</div>;

  let formattedInput: { key: string; value: string } | null = null;
  try {
    const parsed = JSON.parse(input);
    const key = Object.keys(parsed)[0];
    const value = JSON.stringify(parsed[key]);
    formattedInput = { key, value };
  } catch {
    const parts = input.split("=");
    if (parts.length === 2) {
      formattedInput = { key: parts[0].trim(), value: parts[1].trim() };
    }
  }

  if (!formattedInput) {
    return <pre className="p-4 text-white font-mono">{input}</pre>;
  }

  return (
    <div className="p-4 text-white font-mono text-sm space-y-2">
      <p className="text-gray-400">{formattedInput.key} =</p>
      <div className="bg-zinc-800 rounded-lg p-3">{formattedInput.value}</div>
    </div>
  );
};