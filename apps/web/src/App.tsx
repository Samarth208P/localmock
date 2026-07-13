import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Navbar />
      <main className="flex flex-1">
        {/* Left Panel: Schema Builder */}
        <section className="w-[45%] border-r border-border-subtle p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-lg font-medium">Paste your schema here</p>
            <p className="text-sm mt-2">TypeScript interface, Prisma schema, or raw JSON</p>
          </div>
        </section>

        {/* Right Panel: Preview Table */}
        <section className="w-[55%] p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p className="text-lg font-medium">Preview</p>
            <p className="text-sm mt-2">Generated data will appear here</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
