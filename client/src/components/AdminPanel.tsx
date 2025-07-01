import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { useAdmin } from "../lib/stores/useAdmin";
import { useWords } from "../lib/stores/useWords";
import { usePunishments, Punishment } from "../lib/stores/usePunishments";
import { Lock, Plus, Trash2, Eye, EyeOff, Heart, Clock } from "lucide-react";

export default function AdminPanel() {
  const { isAuthenticated, login, logout } = useAdmin();
  const { words, addWord, removeWord } = useWords();
  const { punishments, addPunishment, removePunishment } = usePunishments();
  const [password, setPassword] = useState("");
  const [newWord, setNewWord] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showWords, setShowWords] = useState(false);
  const [showPunishments, setShowPunishments] = useState(false);
  
  // States for new punishment form
  const [newPunishmentTitle, setNewPunishmentTitle] = useState("");
  const [newPunishmentDescription, setNewPunishmentDescription] = useState("");
  const [newPunishmentCategory, setNewPunishmentCategory] = useState<"leve" | "moderado" | "intenso">("leve");
  const [newPunishmentType, setNewPunishmentType] = useState<"acao" | "posicao" | "fetiche" | "preliminar" | "dominacao">("acao");
  const [newPunishmentDuration, setNewPunishmentDuration] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    const success = login(password);
    if (!success) {
      setLoginError("Senha inválida");
    } else {
      setPassword("");
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      addWord(newWord.trim().toUpperCase());
      setNewWord("");
    }
  };

  const handleRemoveWord = (word: string) => {
    if (confirm(`Tem certeza que deseja remover "${word}"?`)) {
      removeWord(word);
    }
  };

  const handleAddPunishment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPunishmentTitle.trim() && newPunishmentDescription.trim()) {
      addPunishment({
        title: newPunishmentTitle.trim(),
        description: newPunishmentDescription.trim(),
        category: newPunishmentCategory,
        type: newPunishmentType,
        duration: newPunishmentDuration.trim() || undefined
      });
      // Reset form
      setNewPunishmentTitle("");
      setNewPunishmentDescription("");
      setNewPunishmentDuration("");
      setNewPunishmentCategory("leve");
      setNewPunishmentType("acao");
    }
  };

  const handleRemovePunishment = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja remover o castigo "${title}"?`)) {
      removePunishment(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "leve":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "moderado":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "intenso":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <Lock className="h-12 w-12 text-white mx-auto mb-4" />
          <CardTitle className="text-white">Login do Admin</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Digite a senha do admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-400 text-sm text-center">{loginError}</div>
            )}
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 text-center text-xs text-white/60">
            Senha padrão: admin123
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Admin Header */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Gerenciamento de Palavras</CardTitle>
            <Button
              onClick={logout}
              variant="outline"
              className="text-white border-white/20"
            >
              Sair
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Add New Word */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Nova Palavra
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleAddWord} className="flex gap-2">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter new word..."
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
              required
            />
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Word
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Word List */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">
              Current Words ({words.length})
            </CardTitle>
            <Button
              onClick={() => setShowWords(!showWords)}
              variant="outline"
              className="text-white border-white/20"
            >
              {showWords ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Words
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Words
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {showWords ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {words.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 rounded p-2 border border-white/10"
                >
                  <span className="text-white font-mono">{word}</span>
                  <Button
                    onClick={() => handleRemoveWord(word)}
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400/50 hover:bg-red-400/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              Click "Show Words" to view the word list
            </div>
          )}
          
          {words.length === 0 && (
            <div className="text-center text-white/60 py-8">
              No words added yet. Add some words to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
