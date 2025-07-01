import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AgeVerification from "./components/AgeVerification";
import HangmanGame from "./components/HangmanGame";
import AdminPanel from "./components/AdminPanel";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { useAdmin } from "./lib/stores/useAdmin";
import { Shield, GamepadIcon } from "lucide-react";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [currentView, setCurrentView] = useState<'game' | 'admin'>('game');
  const { isAuthenticated } = useAdmin();

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
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Header */}
          <Card className="mb-8 p-4 bg-black/20 backdrop-blur-sm border-white/10">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <GamepadIcon className="h-8 w-8" />
                Adult Hangman
              </h1>
              
              <div className="flex gap-2">
                <Button
                  variant={currentView === 'game' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('game')}
                  className="text-white border-white/20"
                >
                  Play Game
                </Button>
                <Button
                  variant={currentView === 'admin' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('admin')}
                  className="text-white border-white/20"
                >
                  <Shield className="h-4 w-4 mr-2" />
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
