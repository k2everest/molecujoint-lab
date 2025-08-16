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
      const response = await fetch('/functions/v1/pubmed-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          maxResults: params.maxResults || 20,
          searchType: 'general'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const articles = await response.json();
      return articles;
    } catch (error) {
      console.error('Error searching PubMed:', error);
      throw error;
    }
  }


  /**
   * Search for articles related to a specific molecule
   */
  async searchMolecule(moleculeName: string, maxResults = 20): Promise<PubMedArticle[]> {
    try {
      const response = await fetch('/functions/v1/pubmed-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: moleculeName,
          maxResults,
          searchType: 'molecule'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching molecule:', error);
      throw error;
    }
  }

  /**
   * Search for articles related to a disease and potential treatments
   */
  async searchDisease(diseaseName: string, maxResults = 20): Promise<PubMedArticle[]> {
    try {
      const response = await fetch('/functions/v1/pubmed-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: diseaseName,
          maxResults,
          searchType: 'disease'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching disease:', error);
      throw error;
    }
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
    try {
      const response = await fetch('/functions/v1/pubmed-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: targetName,
          maxResults,
          searchType: 'drug_discovery'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching drug discovery:', error);
      throw error;
    }
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

