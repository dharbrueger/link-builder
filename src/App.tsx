import { ChangeEvent, useState } from "react";
import "./App.css";
import axios from "axios";

type TargetValue = string;
type WordList = string[];

type WordResponse = {
  id: number;
  collocation: string;
  relation: string;
  pos: string;
  significance: number;
  basisword: string;
};

function App() {
  const [query, setQuery] = useState("");
  // const [wordList, setWordList] = useState<WordList>([""]);
  const [potentialWords, setPotentialWords] = useState<WordList>([""]);

  // const addWordToList = async () => {
  //   if (!query) return;

  //   const updatedWordList = [...wordList, query];
  //   setWordList(updatedWordList);
  //   setQuery("");
  // };

  const extractWords = (response: WordResponse[]) => {
    const potentialWords: string[] = [];

    response.forEach((word) => {
      const { basisword, collocation } = word;
      const collocationWords = collocation.split(" ");

      if (collocationWords[0] === basisword) {
        potentialWords.push(collocationWords[1]);
      }
    });

    setPotentialWords(potentialWords);
  };

  const getWord = async (): Promise<WordResponse | undefined> => {
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
      },
      headers: {
        "X-RapidAPI-Key": import.meta.env.VITE_LINGUA_TOOLS_KEY,
        "X-RapidAPI-Host": "linguatools-english-collocations.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      extractWords(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value }: { value: TargetValue } = e.target;
    if (!value) return;
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
          {/* <button onClick={addWordToList}>Add Word</button> */}
        </div>
      </div>
      <div className="card">
        <ul>
          {potentialWords.map((word, index) => (
            <li key={index}>{word}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
