import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Calendar } from "lucide-react";

interface AgeVerificationProps {
  onVerify: (verified: boolean) => void;
}

export default function AgeVerification({ onVerify }: AgeVerificationProps) {
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const year = parseInt(birthYear);
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    if (isNaN(year) || year < 1900 || year > currentYear) {
      setError("Por favor, digite um ano de nascimento válido");
      return;
    }
    
    if (age < 18) {
      setError("Você deve ter 18 anos ou mais para acessar este conteúdo");
      return;
    }
    
    onVerify(true);
  };

  const handleDecline = () => {
    // Redirect to a safe page or show appropriate message
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-sm border-red-500/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Verificação de Idade Obrigatória
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6 p-4 bg-red-500/20 rounded-lg border border-red-500/30">
            <p className="text-white text-sm text-center">
              Este conteúdo contém temas adultos e é destinado apenas a audiências maduras.
              Você deve ter 18 anos ou mais para prosseguir.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-white mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Digite seu ano de nascimento:
              </label>
              <input
                type="number"
                id="birthYear"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="YYYY"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-center text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDecline}
                className="flex-1 text-white border-white/30 hover:bg-white/10"
              >
                Tenho Menos de 18
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                I'm 18 or Older
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              By proceeding, you confirm that you are of legal age and consent to viewing adult content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
