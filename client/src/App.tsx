import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgeVerification from "./components/AgeVerification";
import HangmanGame from "./components/HangmanGame";
import AdminPanel from "./components/AdminPanel";
import CoupleSetup from "./components/CoupleSetup";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { useAdmin } from "./lib/stores/useAdmin";
import { useCouple } from "./lib/stores/useCouple";
import { Shield, GamepadIcon, Heart, User } from "lucide-react";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [currentView, setCurrentView] = useState<'game' | 'admin' | 'modeSelect'>('modeSelect');
  const { isAuthenticated } = useAdmin();
  const { gameMode, setGameMode, player1, player2 } = useCouple();

  // Check if user has already verified age in this session
  useEffect(() => {
    const verified = sessionStorage.getItem('age_verified');
    if (verified === 'true') {
      setIsAgeVerified(true);
    }
  }, []);

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      sessionStorage.setItem('age_verified', 'true');
      setIsAgeVerified(true);
    }
  };

  if (!isAgeVerified) {
    return <AgeVerification onVerify={handleAgeVerification} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {/* Navigation Header */}
          <Card className="mb-4 sm:mb-8 p-3 sm:p-4 bg-black/20 backdrop-blur-sm border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
                <GamepadIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-center sm:text-left">Jogo da Forca Adulto</span>
              </h1>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant={currentView === 'game' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('game')}
                  className="text-white border-white/20 flex-1 sm:flex-none"
                  size="sm"
                >
                  Jogar
                </Button>
                <Button
                  variant={currentView === 'admin' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('admin')}
                  className="text-white border-white/20 flex-1 sm:flex-none"
                  size="sm"
                >
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  Admin
                </Button>
              </div>
            </div>
          </Card>

          {/* Main Content */}
          {currentView === 'game' ? (
            <HangmanGame />
          ) : (
            <AdminPanel />
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
