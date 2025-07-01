import DataTable from '@/pages/Browse/DataTable';

function Browse() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-6xl">
        <DataTable />
      </div>
    </div>
  );
}

export default Browse;
