import React, { useState } from 'react';
import { useAdmin } from '@/lib/stores/useAdmin';
import { useWords } from '@/lib/stores/useWords';
import { usePunishments, type Punishment } from '@/lib/stores/usePunishments';
import { useTimeConfig } from '@/lib/stores/useTimeConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Eye, EyeOff, Heart, Clock, Timer, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdminPanel() {
  const { isAuthenticated, login, logout } = useAdmin();
  const { words, addWord, removeWord } = useWords();
  const { 
    punishments, 
    addPunishment, 
    removePunishment 
  } = usePunishments();
  const { 
    config: timeConfig, 
    updateConfig: updateTimeConfig, 
    toggleTimeEnabled, 
    resetToDefaults 
  } = useTimeConfig();

  // Form states for words
  const [newWord, setNewWord] = useState("");
  const [password, setPassword] = useState("");
  const [showWords, setShowWords] = useState(false);
  
  // Form states for punishments
  const [newPunishmentTitle, setNewPunishmentTitle] = useState("");
  const [newPunishmentDescription, setNewPunishmentDescription] = useState("");
  const [newPunishmentCategory, setNewPunishmentCategory] = useState<"leve" | "moderado" | "intenso">("leve");
  const [newPunishmentType, setNewPunishmentType] = useState<"acao" | "posicao" | "fetiche" | "preliminar" | "dominacao">("acao");
  const [newPunishmentDuration, setNewPunishmentDuration] = useState("");
  const [showPunishments, setShowPunishments] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setPassword("");
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      addWord(newWord.trim());
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
        <CardHeader>
          <CardTitle className="text-white text-center">
            Acesso Administrativo
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de administrador..."
              className="bg-white/10 border-white/20 text-white placeholder-white/50"
              required
            />
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Admin Header */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <CardTitle className="text-white text-lg sm:text-xl">Painel de Administração</CardTitle>
            <Button
              onClick={logout}
              variant="outline"
              className="text-white border-white/20 w-full sm:w-auto"
              size="sm"
            >
              Sair
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Words, Punishments, and Time Config */}
      <Tabs defaultValue="words" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border-white/10">
          <TabsTrigger value="words" className="text-white data-[state=active]:bg-purple-600">
            Palavras ({words.length})
          </TabsTrigger>
          <TabsTrigger value="punishments" className="text-white data-[state=active]:bg-purple-600">
            Castigos ({punishments.length})
          </TabsTrigger>
          <TabsTrigger value="time" className="text-white data-[state=active]:bg-purple-600">
            <Timer className="h-4 w-4 mr-1" />
            Tempo
          </TabsTrigger>
        </TabsList>

        {/* Words Tab */}
        <TabsContent value="words" className="space-y-4 sm:space-y-6">
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
                  placeholder="Digite uma nova palavra..."
                  className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  required
                />
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Word List */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  Palavras Atuais ({words.length})
                </CardTitle>
                <Button
                  onClick={() => setShowWords(!showWords)}
                  variant="outline"
                  className="text-white border-white/20"
                >
                  {showWords ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar Palavras
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar Palavras
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {showWords ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {words.map((word) => (
                    <div
                      key={word}
                      className="bg-white/5 rounded-lg p-3 flex justify-between items-center border border-white/10"
                    >
                      <span className="text-white font-medium">{word}</span>
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
                  Clique em "Mostrar Palavras" para ver a lista
                </div>
              )}
              
              {words.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  Nenhuma palavra adicionada ainda. Adicione algumas palavras para começar!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Punishments Tab */}
        <TabsContent value="punishments" className="space-y-4 sm:space-y-6">
          {/* Add New Punishment */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Adicionar Novo Castigo
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleAddPunishment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={newPunishmentTitle}
                    onChange={(e) => setNewPunishmentTitle(e.target.value)}
                    placeholder="Título do castigo..."
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                    required
                  />
                  <Input
                    value={newPunishmentDuration}
                    onChange={(e) => setNewPunishmentDuration(e.target.value)}
                    placeholder="Duração (opcional)..."
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                </div>
                
                <Textarea
                  value={newPunishmentDescription}
                  onChange={(e) => setNewPunishmentDescription(e.target.value)}
                  placeholder="Descrição detalhada do castigo..."
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 min-h-[100px]"
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm mb-2 block">Categoria:</label>
                    <select
                      value={newPunishmentCategory}
                      onChange={(e) => setNewPunishmentCategory(e.target.value as any)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md p-2"
                    >
                      <option value="leve">Leve</option>
                      <option value="moderado">Moderado</option>
                      <option value="intenso">Intenso</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-white text-sm mb-2 block">Tipo:</label>
                    <select
                      value={newPunishmentType}
                      onChange={(e) => setNewPunishmentType(e.target.value as any)}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md p-2"
                    >
                      <option value="acao">Ação</option>
                      <option value="posicao">Posição</option>
                      <option value="fetiche">Fetiche</option>
                      <option value="preliminar">Preliminar</option>
                      <option value="dominacao">Dominação</option>
                    </select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700">
                  Adicionar Castigo
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Punishment List */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  Castigos Atuais ({punishments.length})
                </CardTitle>
                <Button
                  onClick={() => setShowPunishments(!showPunishments)}
                  variant="outline"
                  className="text-white border-white/20"
                >
                  {showPunishments ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar Castigos
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar Castigos
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {showPunishments ? (
                <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                  {punishments.map((punishment) => (
                    <div
                      key={punishment.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold">{punishment.title}</h3>
                            <Badge className={getCategoryColor(punishment.category)}>
                              {punishment.category}
                            </Badge>
                          </div>
                          {punishment.duration && (
                            <div className="flex items-center gap-1 text-white/60 text-sm mb-1">
                              <Clock className="h-3 w-3" />
                              {punishment.duration}
                            </div>
                          )}
                          <p className="text-white/80 text-sm">{punishment.description}</p>
                        </div>
                        <Button
                          onClick={() => handleRemovePunishment(punishment.id, punishment.title)}
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-400/50 hover:bg-red-400/20 ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white/60 py-8">
                  Clique em "Mostrar Castigos" para ver a lista
                </div>
              )}
              
              {punishments.length === 0 && (
                <div className="text-center text-white/60 py-8">
                  Nenhum castigo adicionado ainda. Adicione alguns castigos para começar!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Configuration Tab */}
        <TabsContent value="time" className="space-y-4">
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Tempo
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Enable/Disable Time */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white font-medium">Tempo Habilitado</Label>
                  <p className="text-white/60 text-sm">Ativar ou desativar o sistema de tempo no jogo</p>
                </div>
                <Switch
                  checked={timeConfig.enabled}
                  onCheckedChange={toggleTimeEnabled}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {timeConfig.enabled && (
                <>
                  {/* Initial Time */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Tempo Inicial (segundos)</Label>
                    <Input
                      type="number"
                      value={timeConfig.initialTime}
                      onChange={(e) => updateTimeConfig({ initialTime: parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="120"
                      min="0"
                    />
                    <p className="text-white/60 text-sm">
                      Tempo inicial para cada rodada (atual: {Math.floor(timeConfig.initialTime / 60)}:{(timeConfig.initialTime % 60).toString().padStart(2, '0')})
                    </p>
                  </div>

                  {/* Bonus per correct letter */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Bonus por Letra Correta (segundos)</Label>
                    <Input
                      type="number"
                      value={timeConfig.bonusPerCorrect}
                      onChange={(e) => updateTimeConfig({ bonusPerCorrect: parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="3"
                      min="0"
                    />
                    <p className="text-white/60 text-sm">Tempo bonus adicionado quando acerta uma letra</p>
                  </div>

                  {/* Penalty per wrong letter */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Penalidade por Letra Errada (segundos)</Label>
                    <Input
                      type="number"
                      value={timeConfig.penaltyPerWrong}
                      onChange={(e) => updateTimeConfig({ penaltyPerWrong: parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="5"
                      min="0"
                    />
                    <p className="text-white/60 text-sm">Tempo perdido quando erra uma letra</p>
                  </div>

                  {/* Bonus per complete word */}
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Bonus por Palavra Completa (segundos)</Label>
                    <Input
                      type="number"
                      value={timeConfig.bonusPerWord}
                      onChange={(e) => updateTimeConfig({ bonusPerWord: parseInt(e.target.value) || 0 })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="15"
                      min="0"
                    />
                    <p className="text-white/60 text-sm">Bonus extra quando completa uma palavra</p>
                  </div>
                </>
              )}

              {/* Reset to defaults */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  onClick={resetToDefaults}
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Restaurar Padrões
                </Button>
              </div>

              {/* Current Settings Preview */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Configuração Atual:</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-white/80">
                    <span className="text-purple-300">Status:</span> {timeConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                  </p>
                  {timeConfig.enabled && (
                    <>
                      <p className="text-white/80">
                        <span className="text-purple-300">Tempo Inicial:</span> {Math.floor(timeConfig.initialTime / 60)}:{(timeConfig.initialTime % 60).toString().padStart(2, '0')}
                      </p>
                      <p className="text-white/80">
                        <span className="text-purple-300">Bonus por Acerto:</span> +{timeConfig.bonusPerCorrect}s
                      </p>
                      <p className="text-white/80">
                        <span className="text-purple-300">Penalidade por Erro:</span> -{timeConfig.penaltyPerWrong}s
                      </p>
                      <p className="text-white/80">
                        <span className="text-purple-300">Bonus por Palavra:</span> +{timeConfig.bonusPerWord}s
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}