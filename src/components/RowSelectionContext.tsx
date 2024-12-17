import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Artwork } from './Table'; // Import the Artwork type

// Define the context properties
interface RowSelectionContextProps {
  selectedRows: Artwork[];
  setSelectedRows: (rows: Artwork[]) => void;
  selectRows: (
    totalRowsToSelect: number,
    artworks: Artwork[],
    fetchMoreData: (page: number, rows: number) => Promise<Artwork[]>
  ) => Promise<void>;
}

// Define the provider props
interface RowSelectionProviderProps {
  children: ReactNode;
}

// Create the context
const RowSelectionContext = createContext<RowSelectionContextProps | undefined>(undefined);

// Custom hook to use the RowSelectionContext
export const useRowSelection = () => {
  const context = useContext(RowSelectionContext);
  if (!context) {
    throw new Error('useRowSelection must be used within a RowSelectionProvider');
  }
  return context;
};

// RowSelectionProvider component
export const RowSelectionProvider: React.FC<RowSelectionProviderProps> = ({ children }) => {
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);

  const selectRows = async (
    totalRowsToSelect: number,
    artworks: Artwork[],
    fetchMoreData: (page: number, rows: number) => Promise<Artwork[]>
  ) => {
    const newSelectedRows: Artwork[] = [];
    let remainingRowsToSelect = totalRowsToSelect;
    let currentPage = 1; // Tracks the current page
    const rowsPerPage = artworks.length; // Number of rows per page

    // Step 1: Select rows from the current page
    for (let i = 0; i < artworks.length && remainingRowsToSelect > 0; i++) {
      newSelectedRows.push(artworks[i]);
      remainingRowsToSelect--;
    }

    // Step 2: Fetch and select rows from subsequent pages, if needed
    while (remainingRowsToSelect > 0) {
      currentPage++;
      try {
        // Fetch the next page of data
        const nextPageArtworks = await fetchMoreData(currentPage, rowsPerPage);

        if (!nextPageArtworks || nextPageArtworks.length === 0) {
          console.warn('No more data available to select rows.');
          break; // Stop if there are no more records
        }

        // Select rows from the newly fetched data
        for (let i = 0; i < nextPageArtworks.length && remainingRowsToSelect > 0; i++) {
          newSelectedRows.push(nextPageArtworks[i]);
          remainingRowsToSelect--;
        }
      } catch (error) {
        console.error('Error fetching data for row selection:', error);
        break; // Exit on error
      }
    }

    // Update the selected rows
    setSelectedRows((prevSelected) => [...prevSelected, ...newSelectedRows]);
  };

  return (
    <RowSelectionContext.Provider value={{ selectedRows, setSelectedRows, selectRows }}>
      {children}
    </RowSelectionContext.Provider>
  );
};
