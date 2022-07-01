import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';


function App() {
  const [phoneCalls, setPhoneCalls] = useState([]);
  const [callButtonDisabled, setCallButtonDisabled] = useState(false);
  
  useEffect(() => {
    const getCalls = async () => {
      const { data: { numbers } } = await axios.get('http://localhost:5001/api/numbers');
      const arr = numbers.map((number, index) => {
        return { number, status: "idle", phoneNumberIndex: index };
      });
      setPhoneCalls(arr);
    };
    getCalls();
  }, []);

  const handleInitiateCallsClick = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5001/api/calls', {})

    const sse = new EventSource('http://localhost:5001/sse');
    sse.addEventListener('message', ({ data }) => {
      const updatedData = JSON.parse(data);

      setPhoneCalls(prevState => {
        return prevState.map(p => {
          if (p.phoneNumberIndex === updatedData.phoneNumberIndex) {
            return updatedData;
          }
          return p;
        })
      })
    });

    setCallButtonDisabled(!callButtonDisabled);
  };

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>Phone Numbers</th>
            <th>Calls Status</th>
          </tr>
        </thead>
        <tbody>
          {phoneCalls.map(({ number, status, phoneNumberIndex }) => {
            return (
              <tr key={phoneNumberIndex}>
                <td>{number}</td>
                <td>{status}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button type="button"  disabled={callButtonDisabled} onClick={handleInitiateCallsClick}>Call</button>
    </div>
  );
}

export default App;
