import logo from './logo.svg';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <header className="text-center p-6 bg-white shadow-md rounded-lg max-w-xl w-full">
        <img 
          src={logo} 
          alt="logo" 
          className="mx-auto w-32 h-32 animate-spin-slow" 
          // Added Tailwind to spin the React logo slowly 
        />
        <p className="mt-4 text-gray-700 text-lg">
          Edit <code className="bg-gray-200 px-1 rounded">src/App.js</code> and save to reload.
        </p>
        <a
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Learn React
        </a>

        {/* Flowbite Button Example */}
        <button 
          type="button"
          className="mt-6 text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 text-center inline-flex items-center"
          data-tooltip-target="tooltip-default"
        >
          Flowbite Button
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
          </svg>
        </button>

        {/* Tooltip for Flowbite button */}
        <div
          id="tooltip-default"
          role="tooltip"
          className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-black rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
        >
          This is a Flowbite tooltip example
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      </header>
    </div>
  );
}

export default App;
