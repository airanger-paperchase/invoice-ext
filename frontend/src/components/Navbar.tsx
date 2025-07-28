

export const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-6">
      <div className="text-purple-600 text-2xl font-bold">Invoice Extractor</div>
      <div className="flex space-x-4">
        {/* <button
          className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
          onClick={() => window.location.href = '/'}
        >
          Dashboard
        </button> */}
        <button
          className="bg-green-900 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
          onClick={() => window.location.href = '/stored-invoices'}
        >
          Stored Invoices
        </button>
      </div>
    </nav>
  );
};