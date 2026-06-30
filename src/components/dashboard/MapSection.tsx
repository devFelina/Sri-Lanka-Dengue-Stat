interface MapSectionProps {
  children: React.ReactNode;
  details: React.ReactNode;
}

export default function MapSection({ children, details }: MapSectionProps) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      <div className="lg:col-span-2">{children}</div>
      <div className="lg:col-span-1">{details}</div>
    </section>
  );
}
