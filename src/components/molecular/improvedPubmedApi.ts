export interface PubMedArticle {
  pmid: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  year: string;
  doi?: string;
  url: string;
  keywords?: string[];
  meshTerms?: string[];
  publicationType?: string[];
  hasNewMolecules?: boolean;
  moleculeCount?: number;
}

export interface PubMedSearchParams {
  query: string;
  maxResults?: number;
  sort?: 'relevance' | 'date' | 'author';
  dateRange?: {
    from: string;
    to: string;
  };
  publicationTypes?: string[];
  languages?: string[];
  hasAbstract?: boolean;
  freeFullText?: boolean;
}

export class ImprovedPubMedAPI {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // Traduzir termos de doença para inglês
  private async translateDiseaseToEnglish(disease: string): Promise<string[]> {
    const translations: Record<string, string[]> = {
      // Doenças cardiovasculares
      'hipertensão': ['hypertension', 'high blood pressure'],
      'infarto': ['myocardial infarction', 'heart attack'],
      'arritmia': ['arrhythmia', 'cardiac arrhythmia'],
      'insuficiência cardíaca': ['heart failure', 'cardiac failure'],
      
      // Doenças neurológicas
      'alzheimer': ['alzheimer disease', 'alzheimer\'s disease'],
      'parkinson': ['parkinson disease', 'parkinson\'s disease'],
      'esclerose múltipla': ['multiple sclerosis'],
      'epilepsia': ['epilepsy', 'seizure disorder'],
      'depressão': ['depression', 'major depressive disorder'],
      'ansiedade': ['anxiety', 'anxiety disorder'],
      
      // Câncer
      'câncer': ['cancer', 'neoplasm', 'tumor'],
      'leucemia': ['leukemia', 'leukaemia'],
      'linfoma': ['lymphoma'],
      'melanoma': ['melanoma'],
      'câncer de mama': ['breast cancer', 'breast neoplasm'],
      'câncer de pulmão': ['lung cancer', 'lung neoplasm'],
      
      // Doenças infecciosas
      'covid': ['covid-19', 'sars-cov-2', 'coronavirus'],
      'tuberculose': ['tuberculosis', 'tb'],
      'malária': ['malaria'],
      'hepatite': ['hepatitis'],
      'hiv': ['hiv', 'human immunodeficiency virus', 'aids'],
      
      // Doenças metabólicas
      'diabetes': ['diabetes mellitus', 'diabetes'],
      'obesidade': ['obesity'],
      'síndrome metabólica': ['metabolic syndrome'],
      
      // Doenças autoimunes
      'artrite reumatoide': ['rheumatoid arthritis'],
      'lúpus': ['systemic lupus erythematosus', 'lupus'],
      'psoríase': ['psoriasis'],
      
      // Doenças respiratórias
      'asma': ['asthma'],
      'dpoc': ['copd', 'chronic obstructive pulmonary disease'],
      'fibrose pulmonar': ['pulmonary fibrosis'],
      
      // Doenças gastrointestinais
      'doença de crohn': ['crohn disease', 'crohn\'s disease'],
      'colite ulcerativa': ['ulcerative colitis'],
      'síndrome do intestino irritável': ['irritable bowel syndrome', 'ibs']
    };

    const lowerDisease = disease.toLowerCase();
    
    // Buscar tradução exata
    if (translations[lowerDisease]) {
      return translations[lowerDisease];
    }
    
    // Buscar traduções parciais
    const partialMatches: string[] = [];
    Object.keys(translations).forEach(key => {
      if (lowerDisease.includes(key) || key.includes(lowerDisease)) {
        partialMatches.push(...translations[key]);
      }
    });
    
    if (partialMatches.length > 0) {
      return [...new Set(partialMatches)];
    }
    
    // Se não encontrar tradução, retornar o termo original
    return [disease];
  }

  // Buscar artigos com moléculas novas
  async searchArticlesWithNewMolecules(query: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const moleculeKeywords = [
      'novel compound',
      'new molecule',
      'drug discovery',
      'lead compound',
      'bioactive compound',
      'therapeutic compound',
      'chemical synthesis',
      'molecular design',
      'structure-activity relationship',
      'pharmacophore'
    ];

    const enhancedQuery = `(${query}) AND (${moleculeKeywords.map(k => `"${k}"`).join(' OR ')})`;
    
    return this.searchArticles({
      query: enhancedQuery,
      maxResults,
      hasAbstract: true,
      sort: 'relevance'
    });
  }

  // Buscar por doença com tradução automática
  async searchDisease(disease: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const translations = await this.translateDiseaseToEnglish(disease);
    
    // Criar query com termos traduzidos
    const translatedQueries = translations.map(term => `"${term}"`).join(' OR ');
    const enhancedQuery = `(${translatedQueries}) AND (treatment OR therapy OR drug OR molecule OR compound)`;
    
    const articles = await this.searchArticles({
      query: enhancedQuery,
      maxResults,
      hasAbstract: true,
      sort: 'relevance'
    });

    // Filtrar apenas artigos que mencionam moléculas
    return this.filterArticlesWithMolecules(articles);
  }

  // Filtrar artigos que contêm moléculas
  private filterArticlesWithMolecules(articles: PubMedArticle[]): PubMedArticle[] {
    const moleculeIndicators = [
      'compound',
      'molecule',
      'drug',
      'inhibitor',
      'agonist',
      'antagonist',
      'chemical',
      'synthesis',
      'formula',
      'structure',
      'binding',
      'receptor',
      'enzyme',
      'protein',
      'therapeutic',
      'pharmacological'
    ];

    return articles.filter(article => {
      const text = `${article.title} ${article.abstract || ''}`.toLowerCase();
      const moleculeCount = moleculeIndicators.reduce((count, indicator) => {
        const matches = text.match(new RegExp(indicator, 'g'));
        return count + (matches ? matches.length : 0);
      }, 0);

      article.hasNewMolecules = moleculeCount >= 3;
      article.moleculeCount = moleculeCount;
      
      return article.hasNewMolecules;
    }).sort((a, b) => (b.moleculeCount || 0) - (a.moleculeCount || 0));
  }

  // Buscar moléculas específicas
  async searchMolecule(moleculeName: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const query = `"${moleculeName}" OR "${moleculeName} compound" OR "${moleculeName} molecule"`;
    
    return this.searchArticles({
      query,
      maxResults,
      hasAbstract: true,
      sort: 'relevance'
    });
  }

  // Buscar descoberta de fármacos
  async searchDrugDiscovery(term: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const query = `(${term}) AND ("drug discovery" OR "lead compound" OR "medicinal chemistry" OR "structure-activity relationship" OR "pharmacophore" OR "molecular design")`;
    
    return this.searchArticles({
      query,
      maxResults,
      hasAbstract: true,
      sort: 'date'
    });
  }

  // Método principal de busca
  async searchArticles(params: PubMedSearchParams): Promise<PubMedArticle[]> {
    try {
      // Primeiro, fazer a busca para obter os IDs
      const searchUrl = this.buildSearchUrl(params);
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.text();
      
      // Extrair IDs dos artigos
      const pmids = this.extractPMIDs(searchData);
      
      if (pmids.length === 0) {
        return [];
      }

      // Buscar detalhes dos artigos
      const detailsUrl = this.buildDetailsUrl(pmids);
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.text();
      
      // Parsear os resultados
      return this.parseArticleDetails(detailsData);
      
    } catch (error) {
      console.error('Error searching PubMed:', error);
      return [];
    }
  }

  private buildSearchUrl(params: PubMedSearchParams): string {
    const baseParams = new URLSearchParams({
      db: 'pubmed',
      term: params.query,
      retmax: (params.maxResults || 20).toString(),
      sort: params.sort || 'relevance',
      retmode: 'xml'
    });

    if (this.apiKey) {
      baseParams.append('api_key', this.apiKey);
    }

    if (params.dateRange) {
      baseParams.append('mindate', params.dateRange.from);
      baseParams.append('maxdate', params.dateRange.to);
    }

    if (params.hasAbstract) {
      baseParams.append('term', `${params.query} AND hasabstract`);
    }

    if (params.freeFullText) {
      baseParams.append('term', `${params.query} AND free full text[sb]`);
    }

    return `${this.baseUrl}esearch.fcgi?${baseParams.toString()}`;
  }

  private buildDetailsUrl(pmids: string[]): string {
    const params = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract'
    });

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    return `${this.baseUrl}efetch.fcgi?${params.toString()}`;
  }

  private extractPMIDs(xmlData: string): string[] {
    const pmids: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlData, 'text/xml');
    
    const idElements = doc.querySelectorAll('Id');
    idElements.forEach(element => {
      if (element.textContent) {
        pmids.push(element.textContent);
      }
    });

    return pmids;
  }

  private parseArticleDetails(xmlData: string): PubMedArticle[] {
    const articles: PubMedArticle[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlData, 'text/xml');
    
    const articleElements = doc.querySelectorAll('PubmedArticle');
    
    articleElements.forEach(articleElement => {
      try {
        const pmid = articleElement.querySelector('PMID')?.textContent || '';
        const title = articleElement.querySelector('ArticleTitle')?.textContent || '';
        const abstract = articleElement.querySelector('AbstractText')?.textContent || '';
        
        const authorElements = articleElement.querySelectorAll('Author');
        const authors: string[] = [];
        authorElements.forEach(authorElement => {
          const lastName = authorElement.querySelector('LastName')?.textContent || '';
          const foreName = authorElement.querySelector('ForeName')?.textContent || '';
          if (lastName) {
            authors.push(`${lastName}, ${foreName}`.trim());
          }
        });

        const journal = articleElement.querySelector('Title')?.textContent || '';
        const year = articleElement.querySelector('PubDate Year')?.textContent || 
                    articleElement.querySelector('PubDate MedlineDate')?.textContent?.substring(0, 4) || '';
        
        const doi = articleElement.querySelector('ELocationID[EIdType="doi"]')?.textContent || '';
        
        const keywordElements = articleElement.querySelectorAll('Keyword');
        const keywords: string[] = [];
        keywordElements.forEach(keywordElement => {
          if (keywordElement.textContent) {
            keywords.push(keywordElement.textContent);
          }
        });

        const meshElements = articleElement.querySelectorAll('MeshHeading DescriptorName');
        const meshTerms: string[] = [];
        meshElements.forEach(meshElement => {
          if (meshElement.textContent) {
            meshTerms.push(meshElement.textContent);
          }
        });

        const publicationTypeElements = articleElement.querySelectorAll('PublicationType');
        const publicationType: string[] = [];
        publicationTypeElements.forEach(typeElement => {
          if (typeElement.textContent) {
            publicationType.push(typeElement.textContent);
          }
        });

        const article: PubMedArticle = {
          pmid,
          title,
          abstract,
          authors,
          journal,
          year,
          doi,
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          keywords,
          meshTerms,
          publicationType
        };

        articles.push(article);
      } catch (error) {
        console.error('Error parsing article:', error);
      }
    });

    return articles;
  }

  // Método para obter estatísticas de busca
  async getSearchStats(query: string): Promise<{
    totalResults: number;
    withAbstract: number;
    withMolecules: number;
    recentArticles: number;
  }> {
    try {
      const totalResults = await this.getResultCount(query);
      const withAbstract = await this.getResultCount(`${query} AND hasabstract`);
      const withMolecules = await this.getResultCount(`${query} AND (compound OR molecule OR drug)`);
      const recentArticles = await this.getResultCount(`${query} AND ("2023"[Date - Publication] OR "2024"[Date - Publication] OR "2025"[Date - Publication])`);

      return {
        totalResults,
        withAbstract,
        withMolecules,
        recentArticles
      };
    } catch (error) {
      console.error('Error getting search stats:', error);
      return {
        totalResults: 0,
        withAbstract: 0,
        withMolecules: 0,
        recentArticles: 0
      };
    }
  }

  private async getResultCount(query: string): Promise<number> {
    const url = `${this.baseUrl}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&rettype=count&retmode=xml`;
    
    try {
      const response = await fetch(url);
      const xmlData = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlData, 'text/xml');
      const countElement = doc.querySelector('Count');
      
      return parseInt(countElement?.textContent || '0', 10);
    } catch (error) {
      console.error('Error getting result count:', error);
      return 0;
    }
  }
}

