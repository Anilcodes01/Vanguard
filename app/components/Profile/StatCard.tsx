import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
}

export const StatCard = ({ icon: Icon, value, label }: StatCardProps) => (
  <div className="border border-gray-200 rounded-xl p-5">
    <div className="flex items-center gap-3 mb-3">
      <Icon size={18} className="text-black" />
      <h3 className="text-sm text-black">{label}</h3>
    </div>
    <p className="text-3xl font-bold text-black">{value}</p>
  </div>
);