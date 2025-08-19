import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  BookOpen, 
  ExternalLink, 
  Calendar,
  Users,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Filter,
  Beaker,
  Target,
  Zap,
  Atom,
  Globe,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Languages
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ImprovedPubMedAPI, PubMedArticle, PubMedSearchParams } from '../../utils/improvedPubmedApi';

interface ExtractedMolecule {
  name: string;
  formula?: string;
  type: 'drug' | 'compound' | 'metabolite' | 'protein' | 'unknown';
  confidence: number;
  context?: string;
  mechanism?: string;
  target?: string;
  synonyms?: string[];
}

interface ImprovedPubMedSearchPanelProps {
  className?: string;
  moleculeName?: string;
  onArticleSelect?: (article: PubMedArticle) => void;
  onMoleculesExtracted?: (molecules: ExtractedMolecule[]) => void;
}

export const ImprovedPubMedSearchPanel: React.FC<ImprovedPubMedSearchPanelProps> = ({
  className,
  moleculeName,
  onArticleSelect,
  onMoleculesExtracted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(moleculeName || '');
  const [searchType, setSearchType] = useState<'molecule' | 'disease' | 'drug_discovery' | 'custom'>('disease');
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<PubMedArticle | null>(null);
  const [maxResults, setMaxResults] = useState(20);
  const [extractedMolecules, setExtractedMolecules] = useState<ExtractedMolecule[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMoleculeAnalysis, setShowMoleculeAnalysis] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    totalResults: number;
    withAbstract: number;
    withMolecules: number;
    recentArticles: number;
  } | null>(null);
  const [translatedTerms, setTranslatedTerms] = useState<string[]>([]);
  const [onlyNewMolecules, setOnlyNewMolecules] = useState(true);

  const pubmedApi = new ImprovedPubMedAPI();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setTranslatedTerms([]);
    
    try {
      let results: PubMedArticle[] = [];

      switch (searchType) {
        case 'molecule':
          results = await pubmedApi.searchMolecule(searchQuery, maxResults);
          break;
        case 'disease':
          // Buscar com tradução automática e filtrar apenas artigos com moléculas novas
          if (onlyNewMolecules) {
            results = await pubmedApi.searchDisease(searchQuery, maxResults);
          } else {
            results = await pubmedApi.searchArticles({
              query: searchQuery,
              maxResults,
              hasAbstract: true,
              sort: 'relevance'
            });
          }
          
          // Simular termos traduzidos para exibição
          setTranslatedTerms(await getTranslatedTerms(searchQuery));
          break;
        case 'drug_discovery':
          results = await pubmedApi.searchDrugDiscovery(searchQuery, maxResults);
          break;
        case 'custom':
          if (onlyNewMolecules) {
            results = await pubmedApi.searchArticlesWithNewMolecules(searchQuery, maxResults);
          } else {
            results = await pubmedApi.searchArticles({
              query: searchQuery,
              maxResults,
              hasAbstract: true,
              sort: 'relevance'
            });
          }
          break;
      }

      setArticles(results);
      
      // Obter estatísticas de busca
      const stats = await pubmedApi.getSearchStats(searchQuery);
      setSearchStats(stats);
      
    } catch (error) {
      console.error('Error searching PubMed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTranslatedTerms = async (term: string): Promise<string[]> => {
    // Simulação de tradução - em implementação real, usaria a API de tradução
    const translations: Record<string, string[]> = {
      'diabetes': ['diabetes mellitus', 'diabetes'],
      'hipertensão': ['hypertension', 'high blood pressure'],
      'câncer': ['cancer', 'neoplasm', 'tumor'],
      'alzheimer': ['alzheimer disease', 'alzheimer\'s disease'],
      'covid': ['covid-19', 'sars-cov-2', 'coronavirus'],
      'depressão': ['depression', 'major depressive disorder']
    };
    
    return translations[term.toLowerCase()] || [term];
  };

  const handleArticleClick = (article: PubMedArticle) => {
    setSelectedArticle(article);
    onArticleSelect?.(article);
    
    // Analisar artigo automaticamente
    analyzeArticle(article);
  };

  const analyzeArticle = async (article: PubMedArticle) => {
    setIsAnalyzing(true);
    try {
      // Simulação de extração de moléculas melhorada
      const molecules = extractMoleculesFromArticle(article);
      
      setExtractedMolecules(molecules);
      setShowMoleculeAnalysis(true);
      
      // Notificar componente pai sobre as moléculas extraídas
      onMoleculesExtracted?.(molecules);
      
    } catch (error) {
      console.error('Error analyzing article:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractMoleculesFromArticle = (article: PubMedArticle): ExtractedMolecule[] => {
    const text = `${article.title} ${article.abstract || ''}`.toLowerCase();
    const molecules: ExtractedMolecule[] = [];

    // Padrões para identificar moléculas
    const moleculePatterns = [
      // Nomes de medicamentos comuns
      { pattern: /\b(aspirin|ibuprofen|acetaminophen|morphine|insulin|penicillin)\b/g, type: 'drug' as const },
      // Compostos químicos
      { pattern: /\b[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*\b/g, type: 'compound' as const },
      // Proteínas
      { pattern: /\b\w+(?:ase|in|ine|ide|ate)\b/g, type: 'protein' as const },
      // Inibidores
      { pattern: /\b\w+\s*inhibitor\b/g, type: 'drug' as const },
      // Agonistas/Antagonistas
      { pattern: /\b\w+\s*(?:agonist|antagonist)\b/g, type: 'drug' as const }
    ];

    moleculePatterns.forEach(({ pattern, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const name = match.trim();
          if (name.length > 2 && !molecules.find(m => m.name.toLowerCase() === name.toLowerCase())) {
            
            // Calcular confiança baseada no contexto
            let confidence = 0.5;
            if (text.includes(`${name.toLowerCase()} compound`)) confidence += 0.2;
            if (text.includes(`${name.toLowerCase()} molecule`)) confidence += 0.2;
            if (text.includes(`${name.toLowerCase()} drug`)) confidence += 0.3;
            if (article.keywords?.some(k => k.toLowerCase().includes(name.toLowerCase()))) confidence += 0.2;
            
            confidence = Math.min(1, confidence);

            // Extrair contexto
            const contextMatch = text.match(new RegExp(`.{0,50}${name.toLowerCase()}.{0,50}`, 'i'));
            const context = contextMatch ? contextMatch[0] : undefined;

            // Extrair mecanismo se disponível
            let mechanism: string | undefined;
            if (text.includes('mechanism')) {
              const mechanismMatch = text.match(new RegExp(`${name.toLowerCase()}.{0,100}mechanism.{0,100}`, 'i'));
              mechanism = mechanismMatch ? mechanismMatch[0].substring(0, 100) + '...' : undefined;
            }

            // Extrair alvo se disponível
            let target: string | undefined;
            if (text.includes('target') || text.includes('receptor')) {
              const targetMatch = text.match(new RegExp(`${name.toLowerCase()}.{0,50}(?:target|receptor).{0,50}`, 'i'));
              target = targetMatch ? targetMatch[0].substring(0, 80) + '...' : undefined;
            }

            molecules.push({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              type,
              confidence,
              context,
              mechanism,
              target
            });
          }
        });
      }
    });

    // Ordenar por confiança
    return molecules.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  };

  const searchTypes = [
    { 
      key: 'disease', 
      label: 'Doença', 
      description: 'Buscar tratamentos (com tradução automática)',
      icon: <Target className="w-3 h-3" />
    },
    { 
      key: 'molecule', 
      label: 'Molécula', 
      description: 'Buscar por nome da molécula',
      icon: <Atom className="w-3 h-3" />
    },
    { 
      key: 'drug_discovery', 
      label: 'Descoberta', 
      description: 'Desenvolvimento de medicamentos',
      icon: <Beaker className="w-3 h-3" />
    },
    { 
      key: 'custom', 
      label: 'Personalizada', 
      description: 'Busca personalizada',
      icon: <Search className="w-3 h-3" />
    },
  ];

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Pesquisa PubMed Avançada
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
              placeholder="Digite o termo de busca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Translated Terms Display */}
          {translatedTerms.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <Languages className="w-3 h-3 text-blue-500" />
              <span className="text-muted-foreground">Traduzido para:</span>
              <div className="flex flex-wrap gap-1">
                {translatedTerms.slice(0, 3).map((term, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <>
            {/* Search Type Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tipo de Busca</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {searchTypes.map((type) => (
                  <Button
                    key={type.key}
                    variant={searchType === type.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchType(type.key as any)}
                    className="text-xs h-8 justify-start"
                  >
                    {type.icon}
                    <span className="ml-1">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Apenas moléculas novas</label>
                <Button
                  variant={onlyNewMolecules ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOnlyNewMolecules(!onlyNewMolecules)}
                  className="h-6 px-2 text-xs"
                >
                  {onlyNewMolecules ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Máximo de Resultados</label>
                <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Search Statistics */}
        {searchStats && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Estatísticas da Busca</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Total:</span>
                <div className="font-medium">{searchStats.totalResults.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Com resumo:</span>
                <div className="font-medium">{searchStats.withAbstract.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Com moléculas:</span>
                <div className="font-medium text-blue-600">{searchStats.withMolecules.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Recentes:</span>
                <div className="font-medium text-green-600">{searchStats.recentArticles.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {articles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Resultados ({articles.length})
                {onlyNewMolecules && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    <Beaker className="w-3 h-3 mr-1" />
                    Apenas com moléculas
                  </Badge>
                )}
              </span>
              <Badge variant="outline" className="text-xs">
                PubMed
              </Badge>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {articles.map((article) => (
                <Card
                  key={article.pmid}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:shadow-md",
                    selectedArticle?.pmid === article.pmid && "ring-2 ring-primary",
                    article.hasNewMolecules && "border-l-4 border-l-green-500"
                  )}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold line-clamp-2 flex-1">
                        {article.title}
                      </h4>
                      {article.hasNewMolecules && (
                        <Badge variant="outline" className="text-xs ml-2 text-green-600">
                          <Atom className="w-3 h-3 mr-1" />
                          {article.moleculeCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {article.authors.slice(0, 3).join(', ')}
                        {article.authors.length > 3 && ` +${article.authors.length - 3}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{article.journal} ({article.year})</span>
                    </div>
                    
                    {article.abstract && (
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {article.abstract}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        PMID: {article.pmid}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(article.url, '_blank');
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Molecule Analysis */}
        {showMoleculeAnalysis && extractedMolecules.length > 0 && isExpanded && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Moléculas Identificadas</span>
                {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              <Badge variant="outline" className="text-xs">
                {extractedMolecules.length} encontradas
              </Badge>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {extractedMolecules.map((molecule, index) => (
                <Card key={index} className="p-2 bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium flex items-center gap-1">
                        <Atom className="w-3 h-3" />
                        {molecule.name}
                      </h5>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={molecule.type === 'drug' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {molecule.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            molecule.confidence > 0.8 ? "text-green-600" :
                            molecule.confidence > 0.6 ? "text-yellow-600" : "text-red-600"
                          )}
                        >
                          {Math.round(molecule.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    
                    {molecule.formula && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Fórmula:</strong> {molecule.formula}
                      </div>
                    )}
                    
                    {molecule.mechanism && (
                      <div className="text-xs text-muted-foreground flex items-start gap-1">
                        <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Mecanismo:</strong> {molecule.mechanism}</span>
                      </div>
                    )}
                    
                    {molecule.target && (
                      <div className="text-xs text-muted-foreground flex items-start gap-1">
                        <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span><strong>Alvo:</strong> {molecule.target}</span>
                      </div>
                    )}
                    
                    {molecule.context && (
                      <div className="text-xs text-muted-foreground bg-background/50 p-1 rounded">
                        <strong>Contexto:</strong> {molecule.context}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMoleculeAnalysis(false)}
                className="text-xs"
              >
                Ocultar Análise
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoleculesExtracted?.(extractedMolecules)}
                className="text-xs"
              >
                <Beaker className="w-3 h-3 mr-1" />
                Carregar Moléculas
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isExpanded && articles.length === 0 && (
          <div className="text-center text-xs text-muted-foreground">
            <Globe className="w-4 h-4 mx-auto mb-1 opacity-50" />
            <p>Busque por doenças em português</p>
            <p>Tradução automática incluída</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

