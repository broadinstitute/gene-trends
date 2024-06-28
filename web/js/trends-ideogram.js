/** Upon clicking a triangular annotation or tooltip, plot that gene */
function onClickAnnot(annot) {
  // document.querySelector('#search-genes').value = annot.name;
  // urlParams['q'] = annot.name;
  // updateUrl();

  ideogram.config.relatedGenesMode = 'related';
  // const selector = '#ideogram-container #_ideogramInnerWrap'
  ideogram.plotRelatedGenes(annot.name);
}

function addTrendsIdeogram() {
  const trendsIdeoConfig = {
    container: '#ideogram-container',
    organism: 'homo-sapiens',
    chrWidth: 9,
    chrHeight: 100,
    chrLabelSize: 12,
    annotationHeight: 7,
    // onClickAnnot,
    // onPlotRelatedGenes,
    // onWillShowAnnotTooltip,
    showGeneStructureInTooltip: true,
    showProteinInTooltip: true,
    showParalogNeighborhoods: true,
    onLoad() {

      const mw = document.querySelector('#_ideogramMiddleWrap')
      mw.style.width = '950px';

      const iw = document.querySelector('#_ideogramInnerWrap')
      iw.style.maxWidth = null;

      const ideoEl = document.querySelector('#_ideogram')
      ideoEl.style.left = '170px';

      const trendsEl = document.querySelector('#ideogram-container')
      trendsEl.style.position = null;

      // Handles edge case: when organism lacks chromosome-level assembly
      // if (!genomeHasChromosomes()) {return}
      // this.plotRelatedGenes(gene)
      // showRelatedGenesIdeogram(target)

      ideogram.plotRelatedGenes('TP53');
    }
  }

  window.ideogram = Ideogram.initRelatedGenes(trendsIdeoConfig)
}

document.addEventListener('DOMContentLoaded', addTrendsIdeogram, false);
