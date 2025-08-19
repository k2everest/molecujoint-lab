import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  Search, 
  Beaker, 
  Target, 
  Lightbulb, 
  TrendingUp,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Atom,
  Zap,
  Brain,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PubMedAPI, PubMedArticle } from '../../utils/pubmedApi';
import { MoleculeExtractor, ExtractedMolecule } from '../../utils/moleculeExtractor';
import { useMolecularStore } from '../../store/molecularStore';

interface DiseaseAnalysisPanelProps {
  className?: string;
  onMoleculeLoad?: (molecule: ExtractedMolecule) => void;
}

interface DiseaseReport {
  disease: string;
  totalArticles: number;
  keyMolecules: ExtractedMolecule[];
  therapeuticTargets: string[];
  treatmentMechanisms: string[];
  drugSuggestions: ExtractedMolecule[];
  molecularInsights: string[];
}

export const DiseaseAnalysisPanel: React.FC<DiseaseAnalysisPanelProps> = ({
  className,
  onMoleculeLoad
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [diseaseQuery, setDiseaseQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<DiseaseReport | null>(null);
  const [maxArticles, setMaxArticles] = useState(50);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const pubmedApi = new PubMedAPI();
  const moleculeExtractor = new MoleculeExtractor();
  const { loadMolecule } = useMolecularStore();

  const handleDiseaseAnalysis = async () => {
    if (!diseaseQuery.trim()) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setCurrentStep('Buscando artigos no PubMed...');

    try {
      // Buscar artigos relacionados à doença
      const articles = await pubmedApi.searchDisease(diseaseQuery, maxArticles);
      setAnalysisProgress(25);
      setCurrentStep(`Encontrados ${articles.length} artigos. Analisando conteúdo...`);

      // Gerar relatório de análise
      const diseaseReport = moleculeExtractor.generateDiseaseReport(diseaseQuery, articles);
      setAnalysisProgress(75);
      setCurrentStep('Gerando sugestões de moléculas...');

      // Adicionar sugestões baseadas nos alvos identificados
      const additionalSuggestions = moleculeExtractor.suggestMolecules(
        diseaseReport.therapeuticTargets,
        diseaseQuery
      );

      const finalReport: DiseaseReport = {
        ...diseaseReport,
        drugSuggestions: [...diseaseReport.drugSuggestions, ...additionalSuggestions]
      };

      setReport(finalReport);
      setAnalysisProgress(100);
      setCurrentStep('Análise concluída!');

    } catch (error) {
      console.error('Error analyzing disease:', error);
      setCurrentStep('Erro na análise. Tente novamente.');
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setCurrentStep('');
      }, 2000);
    }
  };

  const handleLoadMolecule = async (molecule: ExtractedMolecule) => {
    try {
      // Tentar gerar estrutura molecular básica
      const structure = moleculeExtractor.generateMoleculeStructure(molecule.name);
      
      if (structure) {
        // Carregar molécula no visualizador
        const atoms = structure.atoms.map((atom, index) => ({
          id: `atom_${index}`,
          element: atom.symbol,
          position: [atom.x, atom.y, atom.z] as [number, number, number],
          color: '#FF0000',
          radius: 1.0
        }));

        const bonds = structure.bonds.map((bond, index) => ({
          id: `bond_${index}`,
          atom1Id: `atom_${bond.from}`,
          atom2Id: `atom_${bond.to}`,
          bondType: 'single' as const,
          length: 1.5
        }));

        loadMolecule({
          id: `mol_${Date.now()}`,
          name: structure.name,
          atoms,
          bonds
        });
        
        onMoleculeLoad?.(molecule);
      } else {
        // Se não tiver estrutura, criar uma estrutura básica
        const atoms = [
          {
            id: 'atom_0',
            element: 'C',
            position: [0, 0, 0] as [number, number, number],
            color: '#909090',
            radius: 0.7
          },
          {
            id: 'atom_1',
            element: 'N',
            position: [1.5, 0, 0] as [number, number, number],
            color: '#3050F8',
            radius: 0.65
          },
          {
            id: 'atom_2',
            element: 'O',
            position: [0, 1.5, 0] as [number, number, number],
            color: '#FF0D0D',
            radius: 0.6
          }
        ];

        const bonds = [
          {
            id: 'bond_0',
            atom1Id: 'atom_0',
            atom2Id: 'atom_1',
            bondType: 'single' as const,
            length: 1.5
          },
          {
            id: 'bond_1',
            atom1Id: 'atom_0',
            atom2Id: 'atom_2',
            bondType: 'single' as const,
            length: 1.5
          }
        ];
        
        loadMolecule({
          id: `mol_${Date.now()}`,
          name: molecule.name,
          atoms,
          bonds
        });
        onMoleculeLoad?.(molecule);
      }
    } catch (error) {
      console.error('Error loading molecule:', error);
    }
  };

  const exportReport = () => {
    if (!report) return;

    const reportText = `
# Relatório de Análise: ${report.disease}

## Resumo
- Total de artigos analisados: ${report.totalArticles}
- Moléculas-chave identificadas: ${report.keyMolecules.length}
- Alvos terapêuticos: ${report.therapeuticTargets.length}
- Sugestões de medicamentos: ${report.drugSuggestions.length}

## Insights Moleculares
${report.molecularInsights.map(insight => `- ${insight}`).join('\n')}

## Moléculas-Chave
${report.keyMolecules.map(mol => `
### ${mol.name}
- Tipo: ${mol.type}
- Confiança: ${Math.round(mol.confidence * 100)}%
- Mecanismo: ${mol.mechanism || 'N/A'}
- Alvo: ${mol.target || 'N/A'}
- Contexto: ${mol.context}
`).join('\n')}

## Alvos Terapêuticos
${report.therapeuticTargets.map(target => `- ${target}`).join('\n')}

## Mecanismos de Tratamento
${report.treatmentMechanisms.map(mechanism => `- ${mechanism}`).join('\n')}

## Sugestões de Medicamentos
${report.drugSuggestions.map(drug => `
### ${drug.name}
- Tipo: ${drug.type}
- Mecanismo: ${drug.mechanism || 'N/A'}
- Alvo: ${drug.target || 'N/A'}
- Contexto: ${drug.context}
`).join('\n')}

---
Relatório gerado pelo MolecuJoint Lab
Data: ${new Date().toLocaleDateString('pt-BR')}
    `;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_${report.disease.replace(/\s+/g, '_')}_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Análise de Doenças
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome da doença (ex: HIV, Alzheimer)..."
              value={diseaseQuery}
              onChange={(e) => setDiseaseQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleDiseaseAnalysis()}
              className="flex-1"
            />
            <Button
              onClick={handleDiseaseAnalysis}
              disabled={isAnalyzing || !diseaseQuery.trim()}
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Max Articles */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Máximo de Artigos</label>
              <Input
                type="number"
                min="10"
                max="200"
                value={maxArticles}
                onChange={(e) => setMaxArticles(parseInt(e.target.value) || 50)}
                className="w-20"
              />
            </div>
          </>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Analisando...</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentStep}</p>
          </div>
        )}

        {/* Report Results */}
        {report && isExpanded && (
          <div className="space-y-4">
            {/* Report Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Relatório: {report.disease}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportReport}
                className="text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-2 bg-muted/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{report.totalArticles}</div>
                  <div className="text-xs text-muted-foreground">Artigos</div>
                </div>
              </Card>
              <Card className="p-2 bg-muted/50">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{report.keyMolecules.length}</div>
                  <div className="text-xs text-muted-foreground">Moléculas</div>
                </div>
              </Card>
            </div>

            {/* Molecular Insights */}
            {report.molecularInsights.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">Insights Moleculares</span>
                </div>
                <div className="space-y-1">
                  {report.molecularInsights.map((insight, index) => (
                    <div key={index} className="text-xs bg-muted/50 p-2 rounded">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Molecules */}
            {report.keyMolecules.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Atom className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Moléculas-Chave</span>
                  <Badge variant="outline" className="text-xs">
                    {report.keyMolecules.length}
                  </Badge>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {report.keyMolecules.slice(0, 10).map((molecule, index) => (
                    <Card key={index} className="p-2 bg-muted/50">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">{molecule.name}</h5>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant={molecule.type === 'drug' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {molecule.type}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadMolecule(molecule)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {molecule.mechanism && (
                          <div className="text-xs text-muted-foreground flex items-start gap-1">
                            <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{molecule.mechanism}</span>
                          </div>
                        )}
                        
                        {molecule.target && (
                          <div className="text-xs text-muted-foreground flex items-start gap-1">
                            <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{molecule.target}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Drug Suggestions */}
            {report.drugSuggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Sugestões de Medicamentos</span>
                  <Badge variant="outline" className="text-xs">
                    {report.drugSuggestions.length}
                  </Badge>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {report.drugSuggestions.slice(0, 8).map((drug, index) => (
                    <Card key={index} className="p-2 bg-green-50/50 border-green-200">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-green-800">{drug.name}</h5>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs border-green-300">
                              Sugestão
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadMolecule(drug)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-green-700">
                          {drug.context}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Therapeutic Targets */}
            {report.therapeuticTargets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Alvos Terapêuticos</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {report.therapeuticTargets.slice(0, 8).map((target, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!isExpanded && !report && (
          <div className="text-xs text-muted-foreground text-center py-4">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Analise doenças e descubra moléculas terapêuticas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

