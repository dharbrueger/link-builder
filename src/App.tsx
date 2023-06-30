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
  const [potentialCollocations, setPotentialCollocations] =
    useState<CollocationList>([]);
  const [linkWords, setLinkWords] = useState<CollocationList>([]);
  const activeLink = linkWords.length !== 0;
  const impossibleLink = activeLink && potentialCollocations.length === 0;

  const extractPotentialCollocations = (
    response: CollocationsResponse[]
  ): string[] => {
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

  const getLinkableWords = async (
    word = ""
  ): Promise<CollocationsResponse | undefined> => {
    if (!query && !word) return;

    const options = {
      method: "GET",
      url: "https://linguatools-english-collocations.p.rapidapi.com/bolls/v2",
      params: {
        lang: "en",
        query: word || query,
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
      if (query && !activeLink) {
        setLinkWords([query]);
      }

      setPotentialCollocations(extractPotentialCollocations(response.data));
    } catch (error) {
      console.error(error);
    }
  };

  const resetLink = () => {
    setPotentialCollocations([]);
    setLinkWords([]);
  };

  const addLinkWord = (word: string) => {
    setLinkWords([...linkWords, `- ${word}`]);
    getLinkableWords(word);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value }: { value: TargetValue } = e.target;
    setQuery(value);
  };

  return (
    <>
      <h1>li-nk builder</h1>
      {activeLink &&
        linkWords.map((word, index) => (
          <span key={index} className="linkWord">
            {word}
          </span>
        ))}
      <div>
        {!activeLink && !impossibleLink && (
          <>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Enter a word"
            />
            <div style={{ marginTop: "50px" }}>
              <button
                onClick={() => getLinkableWords()}
                disabled={!query}
                style={{ marginRight: "20px" }}
              >
                Get Linkable Words
              </button>
            </div>
          </>
        )}
      </div>
      <div className="card">
        <ul>
          {potentialCollocations.map((collocation, index) => (
            <li
              key={index}
              onClick={() => addLinkWord(collocation)}
              className="potentialCollocation"
            >
              {collocation}
            </li>
          ))}
        </ul>
      </div>
      {activeLink && (
          <div className="linkControls">
            <button onClick={resetLink}>Reset Link</button>
          </div>
        )}
    </>
  );
}

export default App;
