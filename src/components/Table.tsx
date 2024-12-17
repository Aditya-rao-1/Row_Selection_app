import React, { useEffect, useState } from 'react';
import { DataTable, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRowSelection } from './RowSelectionContext'; // Import the context
import "../index.css";

// Artwork type definition
export interface Artwork {
  id: number;
  title: string;
  artist_display: string;
  place_of_origin: string;
  date_start: number;
  date_end: number;
}

const Table: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]); // Table data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [totalRecords, setTotalRecords] = useState<number>(0); // Total records
  const [page, setPage] = useState<number>(1); // Current page
  const [rows, setRows] = useState<number>(12); // Rows per page
  const [inputRows, setInputRows] = useState<number>(0); // Input for number of rows to select

  const { selectedRows, setSelectedRows, selectRows } = useRowSelection();
  const op = React.useRef<OverlayPanel>(null);

  // Fetch data from API
  const fetchArtworks = async (page: number, rows: number): Promise<Artwork[]> => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rows}`
      );
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
      return data.data; // Return the data for row selection
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(page, rows);
  }, [page, rows]);

  // Handle page change
  const onPageChange = (event: DataTableStateEvent) => {
    const newPage = (event.page || 0) + 1;
    setPage(newPage);
    setRows(event.rows || 12);
    fetchArtworks(newPage, event.rows || 12);
  };

  // Handle submit for selecting rows across pages
  const handleSubmit = () => {
    selectRows(inputRows, artworks, fetchArtworks);
    op.current?.hide();
  };

  return (
    <div className="card">
      <h2>Row Selection app</h2>

      <DataTable
        value={artworks}
        loading={loading}
        paginator
        rows={rows}
        totalRecords={totalRecords}
        lazy
        first={(page - 1) * rows}
        onPage={onPageChange}
        selectionMode="multiple"
        selection={selectedRows}
        onSelectionChange={(e) => setSelectedRows(e.value)}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="No records found"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
          header={
            <div className="header-with-checkbox-chevron">
              <Button
                icon="pi pi-chevron-down"
                className="p-button-text p-button-sm"
                onClick={(e) => op.current?.toggle(e)}
                style={{ marginLeft: '5px' }}
              />
              <OverlayPanel ref={op} dismissable>
                <div className="custom-selection-panel">
                  <input
                    type="number"
                    placeholder="Select rows..."
                    value={inputRows}
                    onChange={(e) => setInputRows(parseInt(e.target.value) || 0)}
                  />
                  <button onClick={handleSubmit}>Submit</button>
                </div>
              </OverlayPanel>
            </div>
          }
        />
        <Column field="id" header="Code"></Column>
        <Column field="title" header="Title"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="date_start" header="Start Date"></Column>
        <Column field="date_end" header="End Date"></Column>
      </DataTable>
    </div>
  );
};

export default Table;
