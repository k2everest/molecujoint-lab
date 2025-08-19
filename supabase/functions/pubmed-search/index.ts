import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, maxResults = 20, searchType = 'general' } = await req.json()

    if (!query) {
      throw new Error('Query parameter is required')
    }

    // Build search query based on type
    let searchQuery = query
    if (searchType === 'disease') {
      searchQuery = `"${query}"[Title/Abstract] AND ("drug therapy"[MeSH Terms] OR "molecular therapy"[Title/Abstract] OR "treatment"[Title/Abstract])`
    } else if (searchType === 'molecule') {
      searchQuery = `"${query}"[Title/Abstract] OR "${query}"[MeSH Terms]`
    } else if (searchType === 'drug_discovery') {
      searchQuery = `"${query}"[Title/Abstract] AND ("drug discovery"[Title/Abstract] OR "drug design"[Title/Abstract] OR "molecular docking"[Title/Abstract])`
    }

    // Step 1: Search for PMIDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${maxResults}&retmode=json&sort=relevance`
    
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()
    
    if (!searchData.esearchresult?.idlist?.length) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const pmids = searchData.esearchresult.idlist

    // Step 2: Get article details
    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml&rettype=abstract`
    
    const detailsResponse = await fetch(detailsUrl)
    const xmlText = await detailsResponse.text()

    // Parse XML
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    const articles = []

    const articleElements = doc.querySelectorAll('PubmedArticle')
    
    for (const articleElement of articleElements) {
      try {
        const pmid = articleElement.querySelector('PMID')?.textContent || ''
        const title = articleElement.querySelector('ArticleTitle')?.textContent || ''
        const journal = articleElement.querySelector('Journal Title')?.textContent || 
                      articleElement.querySelector('ISOAbbreviation')?.textContent || ''
        
        // Get year from multiple possible locations
        let year = ''
        const pubDate = articleElement.querySelector('PubDate')
        if (pubDate) {
          year = pubDate.querySelector('Year')?.textContent || 
                 pubDate.querySelector('MedlineDate')?.textContent?.slice(0, 4) || ''
        }

        // Get abstract
        const abstractElements = articleElement.querySelectorAll('AbstractText')
        let abstract = ''
        for (const absElement of abstractElements) {
          const label = absElement.getAttribute('Label')
          const text = absElement.textContent || ''
          if (label && text) {
            abstract += `${label}: ${text}\n`
          } else if (text) {
            abstract += text + '\n'
          }
        }

        // Get authors
        const authors = []
        const authorElements = articleElement.querySelectorAll('Author')
        for (const author of authorElements) {
          const lastName = author.querySelector('LastName')?.textContent
          const foreName = author.querySelector('ForeName')?.textContent
          if (lastName) {
            authors.push(foreName ? `${foreName} ${lastName}` : lastName)
          }
        }

        // Get DOI
        const doiElement = articleElement.querySelector('ELocationID[EIdType="doi"]')
        const doi = doiElement?.textContent

        // Get keywords
        const keywords = []
        const keywordElements = articleElement.querySelectorAll('Keyword')
        for (const keyword of keywordElements) {
          const text = keyword.textContent
          if (text) keywords.push(text)
        }

        // Get MeSH terms
        const meshTerms = []
        const meshElements = articleElement.querySelectorAll('DescriptorName')
        for (const mesh of meshElements) {
          const text = mesh.textContent
          if (text) meshTerms.push(text)
        }

        if (pmid && title) {
          articles.push({
            pmid,
            title,
            authors,
            journal,
            year,
            abstract: abstract.trim(),
            doi,
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            keywords: keywords.length > 0 ? keywords : undefined,
            meshTerms: meshTerms.length > 0 ? meshTerms : undefined,
            hasNewMolecules: abstract.toLowerCase().includes('molecule') || 
                           abstract.toLowerCase().includes('compound') ||
                           abstract.toLowerCase().includes('drug') ||
                           keywords.some(k => k.toLowerCase().includes('molecule')),
            moleculeCount: (abstract.match(/\b[A-Z][a-z]*(?:-\d+)?\b/g) || []).length
          })
        }
      } catch (error) {
        console.error('Error parsing article:', error)
      }
    }

    return new Response(JSON.stringify(articles), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in pubmed-search function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})