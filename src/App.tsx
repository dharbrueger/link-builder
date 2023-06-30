import { ChangeEvent, useState } from "react";
import "./App.css";
import axios from "axios";

type TargetValue = string;
type CollocationList = string[];

type CollocationsResponse = {
  id: number;
  collocation: string;
  relation: string;
  pos: string;
  significance: number;
  basisword: string;
};

function App() {
  const [query, setQuery] = useState("");
  const [potentialCollocations, setPotentialCollocations] = useState<CollocationList>([]);

  const extractPotentialCollocations = (response: CollocationsResponse[]): string[] => {
    const potentialCollocations: string[] = [];

    response.forEach((potentialCollocation) => {
      const { basisword, collocation } = potentialCollocation;
      const collocationWords = collocation.split(" ");

      if (collocationWords[0] === basisword) {
        potentialCollocations.push(collocationWords[1]);
      }
    });

    return potentialCollocations;
  };

  const getWord = async (): Promise<CollocationsResponse | undefined> => {
    if (!query) return;

    const options = {
      method: "GET",
      url: "https://linguatools-english-collocations.p.rapidapi.com/bolls/v2",
      params: {
        lang: "en",
        query,
        max_results: "25",
        relation: "N:nn:N",
        pos: "N",
        min_sig: "180",
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_LINGUA_TOOLS_KEY,
        "X-RapidAPI-Host": "linguatools-english-collocations.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      setPotentialCollocations(extractPotentialCollocations(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value }: { value: TargetValue } = e.target;
    setQuery(value);
  };

  return (
    <>
      <h1>li-nk builder</h1>
      <div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Enter a word"
        />
        <div style={{marginTop: '50px'}}>
          <button onClick={getWord} style={{marginRight: '20px'}}>Get Linkable Words</button>
        </div>
      </div>
      <div className="card">
        <ul>
          {potentialCollocations.map((collocation, index) => (
            <li key={index}>{collocation}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
