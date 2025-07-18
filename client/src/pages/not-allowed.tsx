import { Card, CardContent } from "@/components/ui/card";
import { Ban } from "lucide-react";

export default function NotAllowed() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <Ban className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">Acesso Negado</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Você precisa ter pelo menos 18 anos para acessar este conteúdo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
