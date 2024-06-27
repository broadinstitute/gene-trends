import React, { useEffect, useState } from 'react'
import TrendsForm from './TrendsForm'
import { descending, tsv } from 'd3';
import TrendsTable from './TrendsTable';
import TrendsIdeogram from './TrendsIdeogram';
import TrendsTimeline from './TrendsTimeline';

export default function TrendsDashboard() {
  const [geneWikiMap, setGeneWikiMap] = useState<Map<string, string>>(new Map())
  const [geneSymbols, setGeneSymbols ] = useState<string[]>([]);
  const [selectedGene, setSelectedGene] = useState<string>();
  const [geneData, setGeneData] = useState<geneHintType[]>([]);
  useEffect(()=>{
    const promises = [
      tsv('data/gene_page_map.tsv'), // from wiki
      tsv('data/homo-sapiens-pubmed-citations.tsv') // pubmed
    ]
    Promise.all(promises).then(([input, input2])=>{
      setGeneWikiMap(getGeneWikiMap(input));
      setGeneSymbols(getGeneSymbols(input2)); // from pubmed+wiki
      setGeneData(getGenes(input2));
      setSelectedGene(getTopCitedGene(input2))
    }).catch(error=>{
      console.error(error)
    })
  }, [])

  const callback = (gene:string)=>{
    setSelectedGene(gene);
    console.log(gene, geneWikiMap.get(gene))
  }
  return (
    <div className="w3-container">
      <h1 className="w3-text-grey">Gene Trends Dashboard</h1>
      <hr/>
      <div className="w3-container w3-row">
        <div className="w3-container w3-cell">
          <TrendsForm callback={callback} geneSymbols={geneSymbols} geneInfoMap={geneWikiMap}/>
        </div>
        <div className="w3-container w3-cell" style={{width:"80%", minHeight:"500px"}}>
        <div
          id="trends-ideogram"
          style={{'position': 'relative', 'left': '400px'}}
        ></div>
        {selectedGene !== undefined &&
          <TrendsIdeogram gene={selectedGene} />
        }
        </div>
      </div>
      <br/><br/><br/>
      <div className="w3-container w3-row w3-padding-48">
        <div className="w3-cell w3-container" style={{'width': '300px'}}>
          {geneData.length>0 && <TrendsTable geneData={geneData}/>}
        </div>
        <div className="w3-cell w3-container" style={{'position': 'relative', 'top': '50px'}}>
        {selectedGene !== undefined &&
          <TrendsTimeline gene={selectedGene}/>
  }
        </div>
      </div>
    </div>
  )
}

// data parsers
type geneInfoType = {
  'gene_symbol.value': string;
  title: string;
}

export type geneHintType = {
  'gene':string;
  'cites':number;
  'cite_delta':number;
  'cite_rank':number;
  'cite_rank_delta':number;
  // 'views':number;
  // 'view_delta':number;
  // 'view_rank':number;
  // 'view_rank_delta':number;
}

function getGeneWikiMap(data:any[]):Map<string, string>{
  let tempMap:Map<string, string> = new Map();

  (data as geneInfoType[]).forEach((d:geneInfoType)=>{
    tempMap.set(d['gene_symbol.value'], d.title);
  })
  return tempMap;
}

function getGeneSymbols(data:any[]):string[]{
  return (data as geneHintType[]).map((d)=>d.gene)
}

function getGenes(data:any[]):geneHintType[]{
  return (data.map((d)=>{
    let _d = Object.assign({}, d) as geneHintType // make a hard copy

    _d.cites = parseInt(d.cites);
    _d.cite_delta = parseInt(d.cite_delta);
    _d.cite_rank = parseInt(d.cite_rank);
    _d.cite_rank_delta = parseInt(d.cite_rank_delta);
    // _d.views = parseInt(d.views);
    // _d.view_delta = parseInt(d.view_delta);
    // _d.view_rank = parseInt(d.view_rank);
    // _d.view_rank_delta = parseInt(d.view_rank_delta);
    return _d;
  }) )
}

function getTopCitedGene(data:any[]):string{
  return data.sort((a, b)=>descending(parseInt(a.cites), parseInt(b.cites))).slice(0, 1).map((d)=>d.gene)[0]
}
