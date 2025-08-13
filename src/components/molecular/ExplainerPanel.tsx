import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Brain, FlaskConical, Search, Target, Atom, Zap } from 'lucide-react';

export const ExplainerPanel: React.FC = () => {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Guia: Sistema de Análise Molecular com IA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Extração de Moléculas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Extração de Moléculas do PubMed</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Para que serve:</strong> Analisa artigos científicos e identifica automaticamente moléculas terapêuticas, 
              medicamentos, proteínas e alvos mencionados no texto.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Identificação automática de fármacos</Badge>
              <Badge variant="outline" className="mr-2">Extração de alvos terapêuticos</Badge>
              <Badge variant="outline">Análise de mecanismos de ação</Badge>
            </div>
            <p className="text-xs text-blue-600">
              💡 <strong>Como funciona:</strong> Usa padrões de reconhecimento para encontrar nomes de medicamentos 
              (ex: terminados em -vir, -navir) e cruza com uma base de dados de moléculas conhecidas.
            </p>
          </div>
        </div>

        {/* Active Learning */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Active Learning (Aprendizado Ativo)</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-purple-800">
              <strong>Para que serve:</strong> Treina modelos de IA para prever propriedades moleculares, 
              seleciona dados mais informativos e melhora predições iterativamente.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Predição de propriedades ADMET</Badge>
              <Badge variant="outline" className="mr-2">Otimização de datasets</Badge>
              <Badge variant="outline">Redução de experimentos necessários</Badge>
            </div>
            <p className="text-xs text-purple-600">
              💡 <strong>Como funciona:</strong> O modelo identifica quais moléculas seriam mais úteis 
              para melhorar suas predições, focando o aprendizado nos dados mais informativos.
            </p>
          </div>
        </div>

        {/* Análise de Doenças */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Análise de Doenças</h3>
          </div>
          <div className="bg-red-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-red-800">
              <strong>Para que serve:</strong> Busca literatura científica sobre uma doença específica 
              e mapeia moléculas terapêuticas, alvos e mecanismos de tratamento.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Mapeamento de alvos terapêuticos</Badge>
              <Badge variant="outline" className="mr-2">Identificação de medicamentos</Badge>
              <Badge variant="outline">Insights sobre mecanismos</Badge>
            </div>
            <p className="text-xs text-red-600">
              💡 <strong>Como funciona:</strong> Analisa automaticamente artigos do PubMed, extrai moléculas 
              relevantes e gera relatórios com sugestões terapêuticas.
            </p>
          </div>
        </div>

        {/* Predição de Reações */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Predição de Reações</h3>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-yellow-800">
              <strong>Para que serve:</strong> Prevê o que acontece quando você move átomos na molécula - 
              se ligações vão quebrar, formar, ou se a estrutura será estável.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Análise de estabilidade</Badge>
              <Badge variant="outline" className="mr-2">Predição de quebra/formação de ligações</Badge>
              <Badge variant="outline">Cálculo de energia de deformação</Badge>
            </div>
            <p className="text-xs text-yellow-600">
              💡 <strong>Como funciona:</strong> Monitora movimentos atômicos em tempo real e calcula 
              mudanças de energia, tensão estrutural e viabilidade de novas conformações.
            </p>
          </div>
        </div>

        {/* Design de Moléculas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Design de Moléculas com IA</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-green-800">
              <strong>Para que serve:</strong> Projeta novas moléculas para tratar doenças específicas, 
              otimizando propriedades como biodisponibilidade e eficácia.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Scaffold hopping</Badge>
              <Badge variant="outline" className="mr-2">Otimização ADMET</Badge>
              <Badge variant="outline">Avaliação drug-likeness</Badge>
            </div>
            <p className="text-xs text-green-600">
              💡 <strong>Como funciona:</strong> Aplica estratégias de design molecular para gerar 
              estruturas que atendam critérios específicos de eficácia e segurança.
            </p>
          </div>
        </div>

        {/* Predição de Materiais */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-semibold">Predição de Novos Materiais</h3>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg space-y-2">
            <p className="text-sm text-cyan-800">
              <strong>Para que serve:</strong> Prevê propriedades de novos materiais baseado em ligações 
              moleculares e sugere polímeros, nanomateriais e híbridos com propriedades específicas.
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-2">Análise de ligações intermoleculares</Badge>
              <Badge variant="outline" className="mr-2">Predição de propriedades</Badge>
              <Badge variant="outline">Design de novos materiais</Badge>
            </div>
            <p className="text-xs text-cyan-600">
              💡 <strong>Como funciona:</strong> Analisa forças intermoleculares, empacotamento cristalino 
              e prediz propriedades como condutividade, resistência e biodegradabilidade.
            </p>
          </div>
        </div>

        {/* Exemplo Prático */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-primary">
          <h4 className="font-semibold text-primary mb-2">Exemplo Prático - Pesquisa sobre HIV:</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. 🔍 Busca artigos sobre "HIV" no PubMed</li>
            <li>2. 🧬 Extrai moléculas como "zidovudine", "efavirenz", "dolutegravir"</li>
            <li>3. 🎯 Identifica alvos como "reverse transcriptase", "protease", "integrase"</li>
            <li>4. 🤖 Usa active learning para otimizar predições de eficácia</li>
            <li>5. ⚗️ Sugere novas moléculas baseadas nos alvos encontrados</li>
            <li>6. 📊 Gera relatório com insights sobre mecanismos de ação</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};