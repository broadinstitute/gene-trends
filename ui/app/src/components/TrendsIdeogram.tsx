import React, { useEffect, useState } from 'react'
import Ideogram from 'ideogram';

type Props = {
  gene: string; // a gene symbol
}

/** Handle clicks on Ideogram annotations */
function onClickAnnot(this: {
    container: string; organism: string; chrWidth: number; chrHeight: number; chrLabelSize: number; annotationHeight: number; onClickAnnot: (annot: any) => void;
    // onPlotRelatedGenes,
    // onWillShowAnnotTooltip,
    showGeneStructureInTooltip: boolean; showProteinInTooltip: boolean; showParalogNeighborhoods: boolean; onLoad(): void;
  }, annot: any) {
  // Ideogram object; used to inspect ideogram state
  const ideogram = this // eslint-disable-line


}

const defaultIdeoConfig = {
  container: '#trends-ideogram',
  organism: 'homo-sapiens',
  chrWidth: 9,
  chrHeight: 100,
  chrLabelSize: 12,
  annotationHeight: 7,
  onClickAnnot,
  // onPlotRelatedGenes,
  // onWillShowAnnotTooltip,
  showGeneStructureInTooltip: true,
  showProteinInTooltip: true,
  showParalogNeighborhoods: true,
  onLoad() {

    const mw : any = document.querySelector('#_ideogramMiddleWrap')
    mw.style.width = '1200px';

    const iw : any = document.querySelector('#_ideogramInnerWrap')
    iw.style.maxWidth = null;

    const ideoEl : any = document.querySelector('#_ideogram')
    ideoEl.style.left = '170px';

    const trendsEl : any = document.querySelector('#trends-ideogram')
    trendsEl.style.position = null;

    // Handles edge case: when organism lacks chromosome-level assembly
    // if (!genomeHasChromosomes()) {return}
    // this.plotRelatedGenes(gene)
    // showRelatedGenesIdeogram(target)
  }
}

let staticIdeogram: any = null;

let ideogram = Ideogram.initRelatedGenes(defaultIdeoConfig)

function plotGene(gene : any) {

}

export default function TrendsIdeogram({gene}: Props) {

  const [ideoConfig, setIdeoConfig] = useState(defaultIdeoConfig)

  useEffect(() => {
    if (staticIdeogram) {
      staticIdeogram.plotRelatedGenes(gene)
    } else {
      staticIdeogram = ideogram
      setTimeout(function() {
        staticIdeogram.plotRelatedGenes(gene)
      }, 2000)
    }

  }, [gene])

  return (
    <>
    </>
  )
}
