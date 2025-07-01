import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useHangman } from "../lib/stores/useHangman";
import { Trophy, Skull, Target, Percent } from "lucide-react";

export default function GameStats() {
  const { stats } = useHangman();

  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="h-5 w-5" />
          Game Statistics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">Wins</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.wins}</div>
          </div>

          <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
            <div className="flex items-center gap-2 mb-1">
              <Skull className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-300">Losses</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.losses}</div>
          </div>
        </div>

        <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-1">
            <Percent className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">{winRate}%</div>
        </div>

        <div className="text-center pt-2">
          <div className="text-sm text-white/60">
            Total Games: {stats.totalGames}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
