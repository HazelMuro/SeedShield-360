export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-sm border border-dashed border-gray-300 bg-gray-50 p-5 text-sm font-medium text-gray-600">
      {message}
    </div>
  );
}
