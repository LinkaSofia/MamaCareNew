import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-baby-pink-dark mb-4">Mama Care</h1>
          <p className="text-gray-600">Sistema funcionando!</p>
          <div className="mt-8 space-y-4">
            <a href="/login" className="block bg-baby-pink-dark text-white px-6 py-3 rounded-lg hover:opacity-90">
              Ir para Login
            </a>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;