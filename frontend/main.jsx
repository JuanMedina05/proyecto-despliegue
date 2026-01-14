import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (endpoint) => {
    setLoading(true);
    setError(null);
    setResponse('');
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const jsonData = await res.json();
        data = JSON.stringify(jsonData);
      } else {
        data = await res.text();
      }
      setResponse(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>HTTPS Docker Practice</h1>
        <div className="button-group">
          <button onClick={() => callApi('/api/saludo')}>
            Test /api/saludo
          </button>
          <button onClick={() => callApi('/api/servidor')}>
            Test /api/servidor
          </button>
          	<button onClick={() => callApi('/api/servidor')}>
    			Test /api/servidor
  		</button>
        </div>

        <div className="output-area">
          <h3>Response:</h3>
          {loading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}
          {response && <pre>{response}</pre>}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
