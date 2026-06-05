export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 border-b border-gray-200 pb-5 md:flex md:items-end md:justify-between md:gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-seed-950 md:text-4xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-gray-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
