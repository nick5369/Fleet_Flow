export default function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          This module is coming soon.
        </p>
      </div>
    </div>
  );
}
