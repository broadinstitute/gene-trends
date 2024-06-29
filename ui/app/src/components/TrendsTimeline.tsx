
import { randomNormal, randomUniform, range, schemeTableau10 } from 'd3'
import React, {useState, useEffect} from 'react'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { genericType } from '../utils/dataUtils'

type Props = {
  gene:string // a gene symbol
}

const dateFormatter = (time: string | number): string => {
  const date = new Date(time);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
};

export default function TrendsTimeline({gene}: Props) {
  const [vizData, setVizData] = useState<any | null>(null)
  // let vizData = randomDataGenerator(gene)

  console.log('in TrendsTimeline, gene:')
  console.log(gene)
  useEffect(() => {
      const fetchData = async () => {
        const counts = await fetchCounts(gene, 'cites')
        // const counts = randomDataGenerator(gene)
        setVizData(counts);
      };

      fetchData();
    }, [gene]);

  let colorTheme = schemeTableau10;

  if (!vizData) {
    return <></>
  }

  return (
    <LineChart width={1000} height={400} data={vizData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={dateFormatter}/>
      <YAxis/>
      <Tooltip labelFormatter={dateFormatter}/>
      <Legend />
      <Line type="monotone" dataKey={gene} name={gene} stroke={colorTheme[0]} dot={false} />
    </LineChart>
  )
}

/**
 * Request time-series data for Wikipedia page views or PubMed citations, and
 * transform that TSV data into a format for LineChart
 *
 * @param {String} gene: symbol of gene, e.g. "ACE2"
 * @param {String} source: either "views" or "cites"
 * @returns {Array} dateCounts
 */
async function fetchCounts(gene: string, source: string) {
  // E.g. data/views/ACE2.tsv
  // gene = 'ACE2'
  const baseUrl = 'https://raw.githubusercontent.com/broadinstitute/gene-trends/main/gene_files/gene_files_datesorted/'
  const url = `${baseUrl}${gene}_sorted.tsv`
  // const url = `gene_files/gene_files_datesorted/${gene}_sorted.tsv`
  const response = await fetch(url)
  const text = await response.text()
  const dateCounts = []
  const rows = text.split('\n')

  for (let i = 1; i < rows.length - 1; i++) {
    const row = rows[i].split('\t')
    const [_, rawDate, count] = row
    const date = new Date(rawDate)
    const data = {date}
    const countByGene: genericType = {}
    countByGene[gene] = Number(count)
    const dateCount = Object.assign({}, data, countByGene)
    dateCounts.push(dateCount)

  }

  return dateCounts
}
