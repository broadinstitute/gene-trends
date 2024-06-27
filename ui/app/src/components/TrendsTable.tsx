import React, { useMemo } from 'react'
import { geneHintType } from './TrendsDashboard'
import MaterialReactTable, { MRT_ColumnDef } from 'material-react-table';

type Props = {
  geneData: geneHintType[]
}

export default function TrendsTable({geneData}: Props) {
  const attrList = Object.keys(geneData[0]);
  const columns = useMemo<MRT_ColumnDef<geneHintType>[]>(
    ()=>attrList.map((d)=>{
      return {
        accessorKey:d,
        header:d,
        size: 100
      }
    }) as MRT_ColumnDef<geneHintType>[],
    [attrList]
  );

  return (
    <div style={{overflowX: "scroll"}}>
      <h4>Most cited genes: last 180 days</h4>
      <MaterialReactTable
        columns={columns}
        data={geneData}
        columnResizeMode="onChange" //default is "onEnd"
        enableTopToolbar={true}
        muiTableContainerProps={{ sx: { maxHeight: '300px' } }}
        initialState={{
          density: 'compact',
          pagination: { pageSize: 10, pageIndex: 0}
        }}
      />

      <br/>
    </div>

  )
}
