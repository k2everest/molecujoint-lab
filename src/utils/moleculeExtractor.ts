export interface ExtractedMolecule {
  name: string;
  formula?: string;
  type: 'drug' | 'compound' | 'protein' | 'enzyme' | 'receptor' | 'unknown';
  confidence: number; // 0-1
  context: string; // Contexto onde foi encontrada
  synonyms?: string[];
  mechanism?: string;
  target?: string;
}

export interface MoleculeDatabase {
  [key: string]: {
    formula?: string;
    type: ExtractedMolecule['type'];
    synonyms: string[];
    mechanism?: string;
    target?: string;
  };
}

// Base de dados de moléculas conhecidas (expandível)
const MOLECULE_DATABASE: MoleculeDatabase = {
  // HIV Drugs
  'zidovudine': {
    formula: 'C10H13N5O4',
    type: 'drug',
    synonyms: ['AZT', 'azidothymidine', 'retrovir'],
    mechanism: 'Nucleoside reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  'efavirenz': {
    formula: 'C14H9ClF3NO2',
    type: 'drug',
    synonyms: ['sustiva', 'stocrin'],
    mechanism: 'Non-nucleoside reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  'ritonavir': {
    formula: 'C37H48N6O5S2',
    type: 'drug',
    synonyms: ['norvir'],
    mechanism: 'Protease inhibitor',
    target: 'HIV protease'
  },
  'dolutegravir': {
    formula: 'C20H19F2N3O5',
    type: 'drug',
    synonyms: ['tivicay'],
    mechanism: 'Integrase strand transfer inhibitor',
    target: 'HIV integrase'
  },
  'maraviroc': {
    formula: 'C29H41F2N5O',
    type: 'drug',
    synonyms: ['selzentry', 'celsentri'],
    mechanism: 'CCR5 antagonist',
    target: 'CCR5 receptor'
  },
  'tenofovir': {
    formula: 'C9H14N5O4P',
    type: 'drug',
    synonyms: ['viread', 'TDF', 'TAF'],
    mechanism: 'Nucleotide reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  'emtricitabine': {
    formula: 'C8H10FN3O3S',
    type: 'drug',
    synonyms: ['FTC', 'emtriva'],
    mechanism: 'Nucleoside reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  'abacavir': {
    formula: 'C14H18N6O',
    type: 'drug',
    synonyms: ['ABC', 'ziagen'],
    mechanism: 'Nucleoside reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  'darunavir': {
    formula: 'C27H37N3O7S',
    type: 'drug',
    synonyms: ['prezista'],
    mechanism: 'Protease inhibitor',
    target: 'HIV protease'
  },
  'raltegravir': {
    formula: 'C20H21FN6O5',
    type: 'drug',
    synonyms: ['isentress'],
    mechanism: 'Integrase strand transfer inhibitor',
    target: 'HIV integrase'
  },
  'bictegravir': {
    formula: 'C21H18F3N3O5',
    type: 'drug',
    synonyms: ['biktarvy'],
    mechanism: 'Integrase strand transfer inhibitor',
    target: 'HIV integrase'
  },
  'rilpivirine': {
    formula: 'C22H18N6',
    type: 'drug',
    synonyms: ['edurant'],
    mechanism: 'Non-nucleoside reverse transcriptase inhibitor',
    target: 'HIV reverse transcriptase'
  },
  
  // Common proteins and enzymes
  'reverse transcriptase': {
    type: 'enzyme',
    synonyms: ['RT', 'HIV-RT'],
    mechanism: 'Converts viral RNA to DNA',
    target: 'HIV replication'
  },
  'protease': {
    type: 'enzyme',
    synonyms: ['HIV protease', 'PR'],
    mechanism: 'Cleaves viral polyproteins',
    target: 'HIV maturation'
  },
    integrase: {
    type: 'enzyme',
    synonyms: ['IN', 'HIV integrase'],
    mechanism: 'Integrates viral DNA into host genome',
    target: 'HIV integration'
  },
  'gp120': {
    type: 'protein',
    synonyms: ['envelope protein', 'surface glycoprotein'],
    mechanism: 'Viral attachment protein',
    target: 'HIV entry'
  },
  'gp41': {
    type: 'protein',
    synonyms: ['transmembrane protein'],
    mechanism: 'Viral fusion protein',
    target: 'HIV entry'
  },
  'ccr5': {
    type: 'receptor',
    synonyms: ['CCR5 receptor', 'C-C chemokine receptor type 5'],
    mechanism: 'Co-receptor for HIV entry',
    target: 'HIV entry'
  },
  'cd4': {
    type: 'receptor',
    synonyms: ['CD4 receptor', 'CD4+ T cell receptor'],
    mechanism: 'Primary receptor for HIV entry',
    target: 'HIV entry'
  }
};

export interface BasicMoleculeStructure {
  name: string;
  atoms: Array<{ symbol: string; x: number; y: number; z: number }>;
  bonds: Array<{ from: number; to: number; order?: number }>;
}

export class MoleculeExtractor {
  private database: MoleculeDatabase;

  constructor(customDatabase?: MoleculeDatabase) {
    this.database = { ...MOLECULE_DATABASE, ...customDatabase };
  }

  /**
   * Extrai moléculas de um texto científico
   */
  extractMolecules(text: string, context: string = ''): ExtractedMolecule[] {
    const molecules: ExtractedMolecule[] = [];
    const processedText = text.toLowerCase();
    
    // Buscar moléculas conhecidas na base de dados
    for (const [moleculeName, data] of Object.entries(this.database)) {
      const patterns = [moleculeName, ...data.synonyms].map(name => 
        new RegExp(`\\b${this.escapeRegex(name.toLowerCase())}\\b`, 'gi')
      );

      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          const confidence = this.calculateConfidence(moleculeName, text, data.type);
          
          // Só adicionar se a confiança for alta o suficiente e não for apenas uma menção genérica
          if (confidence > 0.6 && this.isSpecificMention(text, moleculeName, data.type)) {
            molecules.push({
              name: this.capitalizeFirst(moleculeName),
              formula: data.formula,
              type: data.type,
              confidence,
              context: this.extractContext(text, matches[0]),
              synonyms: data.synonyms,
              mechanism: data.mechanism,
              target: data.target
            });
          }
          break; // Evitar duplicatas para a mesma molécula
        }
      }
    }

    // Buscar padrões de fórmulas químicas
    const formulaPatterns = [
      /\\b[A-Z][a-z]?(\\d+[A-Z][a-z]?\\d*)*\\b/g, // Fórmulas moleculares simples
      /\\b[A-Z]\\d+[A-Z]\\d+[A-Z]\\d+/g, // Padrões como C6H6O
    ];

    for (const pattern of formulaPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          if (this.isLikelyFormula(match) && !molecules.some(m => m.formula === match)) {
            molecules.push({
              name: `Compound ${match}`,
              formula: match,
              type: 'compound',
              confidence: 0.6,
              context: this.extractContext(text, match)
            });
          }
        }
      }
    }

    // Buscar padrões de nomes de medicamentos/compostos
    const drugPatterns = [
      /\\b\\w+vir\\b/gi, // Antivirais terminados em -vir
      /\\b\\w+navir\\b/gi, // Inibidores de protease
      /\\b\\w+tegravir\\b/gi, // Inibidores de integrase
      /\\b\\w+citabine\\b/gi, // Nucleosídeos
      /\\b\\w+mycin\\b/gi, // Antibióticos
      /\\b\\w+cillin\\b/gi, // Penicilinas
    ];

    for (const pattern of drugPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const cleanMatch = match.toLowerCase();
          if (!molecules.some(m => m.name.toLowerCase() === cleanMatch)) {
            molecules.push({
              name: this.capitalizeFirst(cleanMatch),
              type: 'drug',
              confidence: 0.7,
              context: this.extractContext(text, match)
            });
          }
        }
      }
    }

    // Remover duplicatas e ordenar por confiança
    const uniqueMolecules = this.removeDuplicates(molecules);
    return uniqueMolecules.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Sugere moléculas baseadas em alvos identificados
   */
  suggestMolecules(targets: string[], diseaseContext: string): ExtractedMolecule[] {
    const suggestions: ExtractedMolecule[] = [];

    for (const target of targets) {
      const targetLower = target.toLowerCase();
      
      // Buscar moléculas que tenham esse alvo
      for (const [moleculeName, data] of Object.entries(this.database)) {
        if (data.target && data.target.toLowerCase().includes(targetLower)) {
          suggestions.push({
            name: this.capitalizeFirst(moleculeName),
            formula: data.formula,
            type: data.type,
            confidence: 0.8,
            context: `Suggested for ${diseaseContext} targeting ${target}`,
            synonyms: data.synonyms,
            mechanism: data.mechanism,
            target: data.target
          });
        }
      }
    }

    return this.removeDuplicates(suggestions);
  }

  /**
   * Analisa um artigo PubMed e extrai informações relevantes
   */
  analyzeArticle(title: string, abstract: string, keywords?: string[]): {
    molecules: ExtractedMolecule[];
    targets: string[];
    mechanisms: string[];
    suggestions: ExtractedMolecule[];
  } {
    const fullText = `${title} ${abstract} ${keywords?.join(' ')}`;
    
    const molecules = this.extractMolecules(fullText, 'PubMed Article');
    
    // Extrair alvos mencionados
    const targets = this.extractTargets(fullText);
    
    // Extrair mecanismos
    const mechanisms = this.extractMechanisms(fullText);
    
    // Gerar sugestões baseadas nos alvos encontrados
    const suggestions = this.suggestMolecules(targets, 'research context');

    return {
      molecules,
      targets,
      mechanisms,
      suggestions
    };
  }

  private isSpecificMention(text: string, moleculeName: string, type: ExtractedMolecule['type']): boolean {
    const lowerText = text.toLowerCase();
    const lowerMolecule = moleculeName.toLowerCase();
    
    // Para enzimas como integrase, verificar se é mencionada em contexto específico
    if (type === 'enzyme') {
      const specificContexts = [
        'inhibitor', 'inhibition', 'binding', 'active site', 'crystal structure',
        'drug target', 'therapeutic target', 'compound', 'molecule', 'ligand'
      ];
      
      // Verificar se há contexto específico próximo à menção
      const moleculeIndex = lowerText.indexOf(lowerMolecule);
      if (moleculeIndex !== -1) {
        const contextWindow = lowerText.substring(
          Math.max(0, moleculeIndex - 100),
          Math.min(lowerText.length, moleculeIndex + lowerMolecule.length + 100)
        );
        
        return specificContexts.some(context => contextWindow.includes(context));
      }
      
      return false;
    }
    
    // Para outros tipos, aceitar menções mais facilmente
    return true;
  }

  private calculateConfidence(moleculeName: string, text: string, type: ExtractedMolecule['type']): number {
    let confidence = 0.5;
    
    // Aumentar confiança baseada no tipo
    if (type === 'drug') confidence += 0.2;
    if (type === 'compound') confidence += 0.1;
    
    // Aumentar confiança se aparecer em contexto médico
    const medicalTerms = ['treatment', 'therapy', 'drug', 'inhibitor', 'receptor', 'enzyme'];
    for (const term of medicalTerms) {
      if (text.toLowerCase().includes(term)) {
        confidence += 0.1;
        break;
      }
    }
    
    // Aumentar confiança se aparecer múltiplas vezes
    const occurrences = (text.toLowerCase().match(new RegExp(moleculeName.toLowerCase(), 'g')) || []).length;
    confidence += Math.min(occurrences * 0.05, 0.2);
    
    return Math.min(confidence, 1.0);
  }

  private extractContext(text: string, match: string): string {
    const index = text.toLowerCase().indexOf(match.toLowerCase());
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + match.length + 50);
    
    return text.substring(start, end).trim();
  }

  private extractTargets(text: string): string[] {
    const targetPatterns = [
      /\\b(reverse transcriptase|protease|integrase|ccr5|cd4|gp120|gp41)\\b/gi,
      /\\b\\w+\\s+(receptor|enzyme|protein|kinase|channel)\\b/gi,
      /\\b(target|binding site|active site)\\b/gi
    ];

    const targets: string[] = [];
    
    for (const pattern of targetPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        targets.push(...matches.map(m => m.trim()));
      }
    }

    return [...new Set(targets)]; // Remove duplicatas
  }

  private extractMechanisms(text: string): string[] {
    const mechanismPatterns = [
      /\\b(inhibitor|antagonist|agonist|blocker|activator)\\b/gi,
      /\\b(binds to|targets|inhibits|blocks|activates)\\b/gi,
      /\\b(mechanism of action|mode of action)\\b/gi
    ];

    const mechanisms: string[] = [];
    
    for (const pattern of mechanismPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        mechanisms.push(...matches.map(m => m.trim()));
      }
    }

    return [...new Set(mechanisms)];
  }

  private isLikelyFormula(text: string): boolean {
    // Verificar se parece uma fórmula química válida
    const hasElements = /[A-Z][a-z]?/.test(text);
    const hasNumbers = /\\d/.test(text);
    const isReasonableLength = text.length >= 3 && text.length <= 20;
    
    return hasElements && hasNumbers && isReasonableLength;
  }

  private removeDuplicates(molecules: ExtractedMolecule[]): ExtractedMolecule[] {
    const seen = new Set<string>();
    return molecules.filter(molecule => {
      const key = molecule.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\\\]/g, '\\$&');
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Adiciona uma nova molécula à base de dados
   */
  addMolecule(name: string, data: MoleculeDatabase[string]): void {
    this.database[name.toLowerCase()] = data;
  }

  /**
   * Obtém informações de uma molécula da base de dados
   */
  getMoleculeInfo(name: string): MoleculeDatabase[string] | undefined {
    return this.database[name.toLowerCase()];
  }

  /**
   * Lista todas as moléculas na base de dados
   */
  getAllMolecules(): string[] {
    return Object.keys(this.database);
  }

  /**
   * Gera estruturas moleculares básicas para visualização
   */
  generateMoleculeStructure(moleculeName: string): BasicMoleculeStructure | undefined {
    const basicStructures: { [key: string]: BasicMoleculeStructure } = {
      'zidovudine': {
        name: 'Zidovudine (AZT)',
        atoms: [
          { symbol: 'C', x: 0, y: 0, z: 0 },
          { symbol: 'C', x: 1.4, y: 0, z: 0 },
          { symbol: 'C', x: 2.1, y: 1.2, z: 0 },
          { symbol: 'N', x: 1.4, y: 2.4, z: 0 },
          { symbol: 'C', x: 0, y: 2.4, z: 0 },
          { symbol: 'N', x: -0.7, y: 1.2, z: 0 },
          { symbol: 'O', x: 2.1, y: -1.2, z: 0 },
          { symbol: 'N', x: -0.7, y: 3.6, z: 0 }
        ],
        bonds: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
          { from: 1, to: 6 }, { from: 4, to: 7 }
        ]
      },
      'efavirenz': {
        name: 'Efavirenz',
        atoms: [
          { symbol: 'C', x: 0, y: 0, z: 0 },
          { symbol: 'C', x: 1.4, y: 0, z: 0 },
          { symbol: 'C', x: 2.1, y: 1.2, z: 0 },
          { symbol: 'C', x: 1.4, y: 2.4, z: 0 },
          { symbol: 'C', x: 0, y: 2.4, z: 0 },
          { symbol: 'C', x: -0.7, y: 1.2, z: 0 },
          { symbol: 'F', x: 3.5, y: 1.2, z: 0 },
          { symbol: 'Cl', x: -2.1, y: 1.2, z: 0 },
          { symbol: 'N', x: 0, y: 3.6, z: 0 },
          { symbol: 'O', x: 2.1, y: 3.6, z: 0 }
        ],
        bonds: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
          { from: 2, to: 6 }, { from: 5, to: 7 }, { from: 4, to: 8 },
          { from: 3, to: 9 }
        ]
      },
      'dolutegravir': {
        name: 'Dolutegravir',
        atoms: [
          { symbol: 'C', x: 0, y: 0, z: 0 },
          { symbol: 'C', x: 1.4, y: 0, z: 0 },
          { symbol: 'C', x: 2.1, y: 1.2, z: 0 },
          { symbol: 'N', x: 1.4, y: 2.4, z: 0 },
          { symbol: 'C', x: 0, y: 2.4, z: 0 },
          { symbol: 'N', x: -0.7, y: 1.2, z: 0 },
          { symbol: 'F', x: 3.5, y: 1.2, z: 0 },
          { symbol: 'F', x: 2.1, y: -1.2, z: 0 },
          { symbol: 'O', x: -0.7, y: 3.6, z: 0 },
          { symbol: 'O', x: 2.1, y: 3.6, z: 0 }
        ],
        bonds: [
          { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
          { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 0 },
          { from: 2, to: 6 }, { from: 5, to: 7 }, { from: 4, to: 8 },
          { from: 3, to: 9 }
        ]
      }
    };

    return basicStructures[moleculeName.toLowerCase()];
  }
}


