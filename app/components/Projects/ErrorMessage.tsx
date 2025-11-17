type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#ffffff] text-red-400">
      <p>Error: {message}</p>
    </div>
  );
}
