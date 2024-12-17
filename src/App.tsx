import { RowSelectionProvider } from './components/RowSelectionContext'; // Import the provider
import Table from './components/Table';

const App = () => {
  return (
    <RowSelectionProvider>  {/* Wrap Table component with the RowSelectionProvider */}
      <div>
        <Table />
      </div>
    </RowSelectionProvider>
  );
};

export default App;
