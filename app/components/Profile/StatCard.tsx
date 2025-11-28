import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

export const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <div className="group border border-gray-200 bg-white rounded-xl p-6 transition-all duration-300 hover:border-[#f59120]/30 hover:shadow-lg hover:shadow-orange-500/5">
    <div className="flex items-center gap-4 mb-3">
      <div className="p-2.5 rounded-lg bg-orange-50 group-hover:bg-[#f59120]/10 transition-colors">
        <Icon size={20} className="text-[#f59120]" />
      </div>
      <h3 className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
        {label}
      </h3>
    </div>
    <p className="text-3xl font-bold text-gray-900 ml-1">{value}</p>
  </div>
);