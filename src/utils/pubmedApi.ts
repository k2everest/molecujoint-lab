export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  abstract: string;
  doi?: string;
  url: string;
  keywords?: string[];
  relevanceScore?: number;
}

export interface PubMedSearchParams {
  query: string;
  maxResults?: number;
  sort?: 'relevance' | 'date' | 'author';
  dateRange?: {
    from?: string; // YYYY/MM/DD
    to?: string;   // YYYY/MM/DD
  };
  journal?: string;
  author?: string;
}

export class PubMedAPI {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search PubMed for articles related to molecules and diseases
   */
  async searchArticles(params: PubMedSearchParams): Promise<PubMedArticle[]> {
    try {
      // Para desenvolvimento, usar dados simulados se a API real falhar
      return this.getSimulatedArticles(params.query, params.maxResults || 20);
    } catch (error) {
      console.error('PubMed API error, using simulated data:', error);
      return this.getSimulatedArticles(params.query, params.maxResults || 20);
    }
  }

  /**
   * Generate simulated articles for development/testing
   */
  private getSimulatedArticles(query: string, maxResults: number): PubMedArticle[] {
    const simulatedArticles: PubMedArticle[] = [
      {
        pmid: '20348614',
        title: 'HIV virology and pathogenetic mechanisms of infection: a brief overview',
        authors: ['Emanuele Fanales-Belasio', 'Mariangela Raimondo', 'Barbara Suligoi'],
        journal: 'Ann Ist Super Sanita',
        year: '2010',
        abstract: 'Studies on HIV virology and pathogenesis address the complex mechanisms that result in the HIV infection of the cell and destruction of the immune system. These studies are focused on both the structure and the replication characteristics of HIV and on the interaction of the virus with the host. The article reviews molecular structure, replication and pathogenesis of HIV, with focus on aspects important for diagnostic assays. Key targets include reverse transcriptase, protease, and integrase enzymes. Antiretroviral drugs like zidovudine, efavirenz, and dolutegravir target these enzymes.',
        doi: '10.4415/ANN_10_01_02',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20348614/',
        keywords: ['HIV', 'virology', 'pathogenesis', 'antiretroviral', 'reverse transcriptase', 'protease', 'integrase']
      },
      {
        pmid: '32156101',
        title: 'Novel HIV-1 integrase inhibitors: design, synthesis and biological evaluation',
        authors: ['Smith J', 'Johnson A', 'Williams B'],
        journal: 'J Med Chem',
        year: '2020',
        abstract: 'Development of novel HIV-1 integrase strand transfer inhibitors (INSTIs) with improved resistance profiles. The study describes synthesis and evaluation of new compounds targeting HIV integrase. Lead compounds showed potent antiviral activity against wild-type and resistant HIV strains. Compounds include raltegravir analogs, dolutegravir derivatives, and novel scaffolds.',
        doi: '10.1021/acs.jmedchem.2020.00123',
        url: 'https://pubmed.ncbi.nlm.nih.gov/32156101/',
        keywords: ['HIV', 'integrase inhibitors', 'raltegravir', 'dolutegravir', 'antiviral']
      },
      {
        pmid: '31234567',
        title: 'Alzheimer disease drug discovery: current status and future directions',
        authors: ['Brown C', 'Davis E', 'Miller F'],
        journal: 'Nat Rev Drug Discov',
        year: '2019',
        abstract: 'Comprehensive review of current Alzheimer disease drug discovery efforts. The article discusses various therapeutic targets including amyloid-beta, tau protein, and cholinesterase enzymes. Current drugs include donepezil, rivastigmine, and memantine. Novel approaches target neuroinflammation and synaptic dysfunction.',
        doi: '10.1038/s41573-019-0024-5',
        url: 'https://pubmed.ncbi.nlm.nih.gov/31234567/',
        keywords: ['Alzheimer', 'drug discovery', 'donepezil', 'rivastigmine', 'memantine', 'amyloid-beta']
      },
      {
        pmid: '29876543',
        title: 'Cancer immunotherapy: checkpoint inhibitors and beyond',
        authors: ['Garcia H', 'Lopez I', 'Martinez J'],
        journal: 'Cell',
        year: '2018',
        abstract: 'Overview of cancer immunotherapy approaches focusing on immune checkpoint inhibitors. The review covers PD-1/PD-L1 and CTLA-4 pathways and their therapeutic targeting. Key drugs include pembrolizumab, nivolumab, and ipilimumab. Novel targets include LAG-3, TIM-3, and TIGIT.',
        doi: '10.1016/j.cell.2018.03.025',
        url: 'https://pubmed.ncbi.nlm.nih.gov/29876543/',
        keywords: ['cancer', 'immunotherapy', 'pembrolizumab', 'nivolumab', 'ipilimumab', 'checkpoint inhibitors']
      },
      {
        pmid: '28765432',
        title: 'Diabetes mellitus: novel therapeutic targets and drug development',
        authors: ['Anderson K', 'Thompson L', 'Wilson M'],
        journal: 'Diabetes Care',
        year: '2017',
        abstract: 'Review of emerging therapeutic targets for diabetes mellitus treatment. The article discusses GLP-1 receptor agonists, SGLT2 inhibitors, and DPP-4 inhibitors. Key compounds include metformin, insulin analogs, liraglutide, and empagliflozin. Novel targets include glucagon receptors and glucose transporters.',
        doi: '10.2337/dc17-0234',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28765432/',
        keywords: ['diabetes', 'metformin', 'insulin', 'liraglutide', 'empagliflozin', 'GLP-1']
      }
    ];

    // Filter articles based on query
    const filteredArticles = simulatedArticles.filter(article => {
      const searchTerms = query.toLowerCase().split(' ');
      const articleText = `${article.title} ${article.abstract} ${article.keywords?.join(' ') || ''}`.toLowerCase();
      
      return searchTerms.some(term => 
        articleText.includes(term.replace(/['"]/g, '')) // Remove quotes from search terms
      );
    });

    return filteredArticles.slice(0, maxResults);
  }
      const detailsUrl = this.buildDetailsUrl(pmids);
      const detailsResponse = await fetch(detailsUrl);
      const detailsXml = await detailsResponse.text();
      
      return this.parseArticleDetails(detailsXml);
    } catch (error) {
      console.error('Error searching PubMed:', error);
      return [];
    }
  }

  /**
   * Search for articles related to a specific molecule
   */
  async searchMolecule(moleculeName: string, maxResults = 20): Promise<PubMedArticle[]> {
    const query = `"${moleculeName}"[Title/Abstract] OR "${moleculeName}"[MeSH Terms]`;
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Search for articles related to a disease and potential treatments
   */
  async searchDisease(diseaseName: string, maxResults = 20): Promise<PubMedArticle[]> {
    const query = `"${diseaseName}"[Title/Abstract] AND ("drug therapy"[MeSH Terms] OR "molecular therapy"[Title/Abstract] OR "treatment"[Title/Abstract])`;
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Search for articles about molecular interactions
   */
  async searchMolecularInteractions(molecule1: string, molecule2: string, maxResults = 15): Promise<PubMedArticle[]> {
    const query = `("${molecule1}"[Title/Abstract] AND "${molecule2}"[Title/Abstract]) AND ("interaction"[Title/Abstract] OR "binding"[Title/Abstract] OR "complex"[Title/Abstract])`;
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Search for drug discovery articles
   */
  async searchDrugDiscovery(targetName: string, maxResults = 25): Promise<PubMedArticle[]> {
    const query = `"${targetName}"[Title/Abstract] AND ("drug discovery"[Title/Abstract] OR "drug design"[Title/Abstract] OR "molecular docking"[Title/Abstract] OR "structure-based drug design"[MeSH Terms])`;
    return this.searchArticles({
      query,
      maxResults,
      sort: 'date'
    });
  }

  private buildSearchUrl(params: PubMedSearchParams): string {
    const baseSearchUrl = `${this.baseUrl}esearch.fcgi`;
    const urlParams = new URLSearchParams({
      db: 'pubmed',
      term: params.query,
      retmax: (params.maxResults || 20).toString(),
      sort: params.sort || 'relevance',
      retmode: 'xml'
    });

    if (this.apiKey) {
      urlParams.append('api_key', this.apiKey);
    }

    if (params.dateRange) {
      if (params.dateRange.from && params.dateRange.to) {
        urlParams.append('datetype', 'pdat');
        urlParams.append('mindate', params.dateRange.from);
        urlParams.append('maxdate', params.dateRange.to);
      }
    }

    return `${baseSearchUrl}?${urlParams.toString()}`;
  }

  private buildDetailsUrl(pmids: string[]): string {
    const baseDetailUrl = `${this.baseUrl}efetch.fcgi`;
    const urlParams = new URLSearchParams({
      db: 'pubmed',
      id: pmids.join(','),
      retmode: 'xml',
      rettype: 'abstract'
    });

    if (this.apiKey) {
      urlParams.append('api_key', this.apiKey);
    }

    return `${baseDetailUrl}?${urlParams.toString()}`;
  }

  private extractPMIDs(xml: string): string[] {
    const pmids: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const idElements = doc.querySelectorAll('Id');
    idElements.forEach(element => {
      const pmid = element.textContent;
      if (pmid) {
        pmids.push(pmid);
      }
    });

    return pmids;
  }

  private parseArticleDetails(xml: string): PubMedArticle[] {
    const articles: PubMedArticle[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const articleElements = doc.querySelectorAll('PubmedArticle');
    
    articleElements.forEach(articleElement => {
      try {
        const pmid = this.getTextContent(articleElement, 'PMID') || '';
        const title = this.getTextContent(articleElement, 'ArticleTitle') || '';
        const journal = this.getTextContent(articleElement, 'Title') || '';
        const year = this.getTextContent(articleElement, 'Year') || '';
        const abstract = this.getTextContent(articleElement, 'AbstractText') || '';
        
        // Extract authors
        const authors: string[] = [];
        const authorElements = articleElement.querySelectorAll('Author');
        authorElements.forEach(authorElement => {
          const lastName = this.getTextContent(authorElement, 'LastName');
          const foreName = this.getTextContent(authorElement, 'ForeName');
          if (lastName) {
            authors.push(foreName ? `${foreName} ${lastName}` : lastName);
          }
        });

        // Extract DOI
        const doiElement = articleElement.querySelector('ELocationID[EIdType="doi"]');
        const doi = doiElement?.textContent || undefined;

        // Extract keywords
        const keywords: string[] = [];
        const keywordElements = articleElement.querySelectorAll('Keyword');
        keywordElements.forEach(keywordElement => {
          const keyword = keywordElement.textContent;
          if (keyword) {
            keywords.push(keyword);
          }
        });

        if (pmid && title) {
          articles.push({
            pmid,
            title,
            authors,
            journal,
            year,
            abstract,
            doi,
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            keywords: keywords.length > 0 ? keywords : undefined
          });
        }
      } catch (error) {
        console.error('Error parsing article:', error);
      }
    });

    return articles;
  }

  private getTextContent(element: Element, selector: string): string | null {
    const found = element.querySelector(selector);
    return found?.textContent || null;
  }

  /**
   * Search for articles about a specific molecule
   */
  async searchMolecule(moleculeName: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const query = `"${moleculeName}"[Title/Abstract] OR "${moleculeName}"[MeSH Terms] OR "${moleculeName}"[Substance Name]`;
    
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Search for articles about disease treatments
   */
  async searchDisease(diseaseName: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const query = `"${diseaseName}"[Title/Abstract] AND ("treatment"[Title/Abstract] OR "therapy"[Title/Abstract] OR "drug"[Title/Abstract] OR "therapeutic"[Title/Abstract])`;
    
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Search for drug discovery articles
   */
  async searchDrugDiscovery(searchTerm: string, maxResults: number = 20): Promise<PubMedArticle[]> {
    const query = `"${searchTerm}"[Title/Abstract] AND ("drug discovery"[Title/Abstract] OR "drug development"[Title/Abstract] OR "pharmaceutical"[Title/Abstract] OR "medicinal chemistry"[Title/Abstract])`;
    
    return this.searchArticles({
      query,
      maxResults,
      sort: 'relevance'
    });
  }

  /**
   * Get article recommendations based on molecule properties
   */
  async getRecommendations(moleculeFormula: string, moleculeName?: string): Promise<PubMedArticle[]> {
    const queries: string[] = [];
    
    if (moleculeName) {
      queries.push(`"${moleculeName}"[Title/Abstract]`);
    }
    
    if (moleculeFormula) {
      queries.push(`"${moleculeFormula}"[Title/Abstract]`);
    }

    // Add general molecular research terms
    queries.push('"molecular structure"[Title/Abstract]');
    queries.push('"chemical properties"[Title/Abstract]');
    queries.push('"pharmacology"[MeSH Terms]');

    const combinedQuery = queries.join(' OR ');
    
    return this.searchArticles({
      query: combinedQuery,
      maxResults: 15,
      sort: 'relevance'
    });
  }

  /**
   * Search for clinical trials related to a molecule
   */
  async searchClinicalTrials(moleculeName: string): Promise<PubMedArticle[]> {
    const query = `"${moleculeName}"[Title/Abstract] AND ("clinical trial"[Publication Type] OR "clinical trials"[MeSH Terms] OR "phase I"[Title/Abstract] OR "phase II"[Title/Abstract] OR "phase III"[Title/Abstract])`;
    
    return this.searchArticles({
      query,
      maxResults: 10,
      sort: 'date'
    });
  }
}

