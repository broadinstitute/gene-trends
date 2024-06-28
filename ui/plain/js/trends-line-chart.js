async function addLineChart(gene) {
  const trendData = await fetchTrendData(gene)

  var viewsTrace = {
    x: trendData.views.x,
    y: trendData.views.y,
    name: 'Views in Wikipedia',
    type: 'scatter'
  };

  var citesTrace = {
    x: trendData.cites.x,
    y: trendData.cites.y,
    name: 'Citations in PubMed',
    type: 'scatter'
  };

  var data = [viewsTrace, citesTrace];

  var layout = {
    title: `Interest over time: ${gene}`
  };

  Plotly.newPlot('line-chart-container', data, layout);
}

/**
 * Request time-series data for Wikipedia page views or PubMed citations, and
 * transform that TSV data into a format for Plotly.js line chart
 *
 * @param {String} gene: symbol of gene, e.g. "ACE2"
 * @param {String} source: either "views" or "cites"
 * @returns {Object} trace: arrays of X, Y values for a line in chart
 */
async function fetchCounts(gene, source) {
  // E.g. data/views/ACE2.tsv
  const url = `data/${source}/${gene}.tsv`
  const response = await fetch(url)
  const text = await response.text()
  const xyObject = {x: [], y: []}
  const rows = text.split('\n')

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].split('\t')
    const [date, count] = row
    if (!count || isNaN(count)) continue // Skip e.g. header
    xyObject.x.push(date) // Time, e.g. "2020-01-15"
    xyObject.y.push(count) // Popularity / interest value -- an integer
  }
  return xyObject
}

async function fetchTrendData(gene) {
  const viewsXY = await fetchCounts(gene, 'views')
  const citesXY = await fetchCounts(gene, 'cites')
  const trendData = {views: viewsXY, cites: citesXY}
  return trendData
}

document.addEventListener('DOMContentLoaded', function() {addLineChart(defaultGene)}, false);

