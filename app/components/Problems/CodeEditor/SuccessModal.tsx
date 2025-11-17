import { Star, Trophy, X, Zap } from "lucide-react";

export const SuccessModal = ({ xp, stars, onClose }: { xp: number, stars: number, onClose: () => void }) => {
  const renderStars = (count: number) => {
    return Array(3).fill(0).map((_, i) => (
      <Star
        key={i}
        size={40}
        className={`transition-all duration-500 ${i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
        style={{ transitionDelay: `${100 * i}ms` }}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-8 text-center w-full max-w-sm relative animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-gray-900">
          <Trophy size={40} className="text-white" />
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-3xl font-bold text-white mt-10 mb-2">Problem Solved!</h2>
        <p className="text-gray-400 mb-6">Congratulations! Here are your rewards.</p>
        
        <div className="bg-gray-800/50 rounded-xl p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-2">STARS EARNED</p>
            <div className="flex justify-center items-center gap-3">
              {renderStars(stars)}
            </div>
          </div>
          <div className="border-t border-gray-700/50"></div>
          <div>
            <p className="text-sm text-gray-500 font-medium mb-2">XP GAINED</p>
            <div className="flex items-center justify-center gap-2">
              <Zap className="text-yellow-400" size={20} />
              <p className="text-2xl font-bold text-white">+{xp} XP</p>
            </div>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="mt-8 w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};