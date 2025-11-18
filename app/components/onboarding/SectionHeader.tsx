export const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
    <div className="bg-gray-100 p-3 rounded-lg">
      <Icon className="text-[#f59120] h-6 w-6" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-black">{title}</h2>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  </div>
);
