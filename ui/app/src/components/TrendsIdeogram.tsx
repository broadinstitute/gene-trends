import React, { useEffect, useState } from 'react'
import Ideogram from 'ideogram';

type Props = {
  gene: string; // a gene symbol
  updateSelectedGene: Function
}


export default function TrendsIdeogram({gene, updateSelectedGene}: Props) {

  /** Handle clicks on Ideogram annotations */
  function onClickAnnot(this: any, annot: any) {
    const ideogram = this // eslint-disable-line

    const newGene = annot.name
    updateSelectedGene(newGene)
    ideogram.plotRelatedGenes(newGene);
  }

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

      // Handles edge case: when organism lacks chromosome-level assembly
      // if (!genomeHasChromosomes()) {return}
      // this.plotRelatedGenes(gene)
      // showRelatedGenesIdeogram(target)
    }
  }

  let staticIdeogram: any = null;

  let ideogram = Ideogram.initRelatedGenes(defaultIdeoConfig)

  return (
    <>
    </>
  )
}
