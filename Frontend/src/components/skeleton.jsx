const Skeleton = ({ className = '', rows = 1 }) => {
  if (rows > 1) {
    return (
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`animate-pulse rounded bg-slate-200 ${className || 'h-4 w-full'}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className || 'h-4 w-full'}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
