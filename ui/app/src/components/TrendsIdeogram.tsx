import React, { useEffect, useState } from 'react'
import Ideogram from 'ideogram';

type Props = {
  gene: string; // a gene symbol
  updateSelectedGene: Function,
  ideogram: any,
  setIdeogram: Function
}


export default function TrendsIdeogram({gene, updateSelectedGene, ideogram, setIdeogram}: Props) {

  /** Handle clicks on Ideogram annotations */
  function onClickAnnot(this: any, annot: any) {
    const ideogram = this // eslint-disable-line

    const newGene = annot.name
    updateSelectedGene(newGene)
    ideogram.plotRelatedGenes(newGene);
  }

  useEffect(() => {
    if (ideogram) {
      ideogram.plotRelatedGenes(gene)
    }
  }, [gene])

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
      mw.style.width = '950px';

      const iw : any = document.querySelector('#_ideogramInnerWrap')
      iw.style.maxWidth = null;

      const ideoEl : any = document.querySelector('#_ideogram')
      ideoEl.style.left = '170px';

      const trendsEl : any = document.querySelector('#trends-ideogram')
      trendsEl.style.position = null;

      setIdeogram(this)

      // Handles edge case: when organism lacks chromosome-level assembly
      // if (!genomeHasChromosomes()) {return}
      const ideo: any = this // eslint-disable-line
      ideo.plotRelatedGenes(gene)
      // showRelatedGenesIdeogram(target)
    }
  }

  if (!ideogram) {
    Ideogram.initRelatedGenes(defaultIdeoConfig)
  }

  return (
    <>
    </>
  )
}
