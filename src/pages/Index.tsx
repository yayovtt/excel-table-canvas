
import AdvancedTable from '@/components/AdvancedTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 px-4">
          <AdvancedTable />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
