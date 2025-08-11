import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
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
  Atom
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { PubMedAPI, PubMedArticle, PubMedSearchParams } from '../../utils/pubmedApi';
import { MoleculeExtractor, ExtractedMolecule } from '../../utils/moleculeExtractor';

interface PubMedSearchPanelProps {
  className?: string;
  moleculeName?: string;
  onArticleSelect?: (article: PubMedArticle) => void;
  onMoleculesExtracted?: (molecules: ExtractedMolecule[]) => void;
}

export const PubMedSearchPanel: React.FC<PubMedSearchPanelProps> = ({
  className,
  moleculeName,
  onArticleSelect,
  onMoleculesExtracted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(moleculeName || '');
  const [searchType, setSearchType] = useState<'molecule' | 'disease' | 'interaction' | 'drug_discovery' | 'custom'>('molecule');
  const [isLoading, setIsLoading] = useState(false);
  const [articles, setArticles] = useState<PubMedArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<PubMedArticle | null>(null);
  const [maxResults, setMaxResults] = useState(20);
  const [extractedMolecules, setExtractedMolecules] = useState<ExtractedMolecule[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMoleculeAnalysis, setShowMoleculeAnalysis] = useState(false);

  const pubmedApi = new PubMedAPI();
  const moleculeExtractor = new MoleculeExtractor();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      let results: PubMedArticle[] = [];

      switch (searchType) {
        case 'molecule':
          results = await pubmedApi.searchMolecule(searchQuery, maxResults);
          break;
        case 'disease':
          results = await pubmedApi.searchDisease(searchQuery, maxResults);
          break;
        case 'drug_discovery':
          results = await pubmedApi.searchDrugDiscovery(searchQuery, maxResults);
          break;
        case 'custom':
          results = await pubmedApi.searchArticles({
            query: searchQuery,
            maxResults,
            sort: 'relevance'
          });
          break;
      }

      setArticles(results);
    } catch (error) {
      console.error('Error searching PubMed:', error);
    } finally {
      setIsLoading(false);
    }
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
      const analysis = moleculeExtractor.analyzeArticle(
        article.title,
        article.abstract || '',
        article.keywords
      );
      
      setExtractedMolecules(analysis.molecules);
      setShowMoleculeAnalysis(true);
      
      // Notificar componente pai sobre as moléculas extraídas
      onMoleculesExtracted?.(analysis.molecules);
      
    } catch (error) {
      console.error('Error analyzing article:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchTypes = [
    { key: 'molecule', label: 'Molécula', description: 'Buscar por nome da molécula' },
    { key: 'disease', label: 'Doença', description: 'Buscar tratamentos para doenças' },
    { key: 'drug_discovery', label: 'Descoberta de Fármacos', description: 'Pesquisa de desenvolvimento de medicamentos' },
    { key: 'custom', label: 'Personalizada', description: 'Busca personalizada' },
  ];

  return (
    <Card className={cn("w-96 bg-card/95 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Pesquisa PubMed
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
                    onClick={() => setSearchType(type.key as 'molecule' | 'disease' | 'interaction' | 'drug_discovery' | 'custom')}
                    className="text-xs h-8"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Max Results */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Máximo de Resultados</label>
              <Input
                type="number"
                min="5"
                max="100"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value) || 20)}
                className="w-20"
              />
            </div>
          </>
        )}

        {/* Results */}
        {articles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resultados ({articles.length})</span>
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
                    selectedArticle?.pmid === article.pmid && "ring-2 ring-primary"
                  )}
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold line-clamp-2">
                      {article.title}
                    </h4>
                    
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

        {/* Selected Article Details */}
        {selectedArticle && isExpanded && (
          <div className="space-y-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Artigo Selecionado</span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{selectedArticle.title}</h4>
              
              {selectedArticle.abstract && (
                <Textarea
                  value={selectedArticle.abstract}
                  readOnly
                  className="text-xs h-24 resize-none"
                />
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedArticle.url, '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Ver no PubMed
                </Button>
                
                {selectedArticle.doi && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://doi.org/${selectedArticle.doi}`, '_blank')}
                    className="text-xs"
                  >
                    DOI
                  </Button>
                )}
              </div>
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
                    
                    {molecule.synonyms && molecule.synonyms.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {molecule.synonyms.slice(0, 3).map((synonym, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {synonym}
                          </Badge>
                        ))}
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
        {!isExpanded &&
(Content truncated due to size limit. Use page ranges or line ranges to read remaining content)