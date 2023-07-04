import { ChangeEvent, useState } from "react";
import "./App.css";
import axios from "axios";
import { LinguisticPatterns } from "./constants/LinguisticPatterns";
import RelationSelector from "./RelationSelector";

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

type SliderProps = {
	sliderValue: number;
	handleSliderChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

const SliderComponent: React.FC<SliderProps> = ({
	sliderValue,
	handleSliderChange,
}) => {
	return (
		<div style={{ marginTop: "50px" }}>
			<input
				type="range"
				min="0"
				max="10000"
				value={sliderValue}
				onChange={handleSliderChange}
			/>
			<div>Collocation Significance: {sliderValue}</div>
		</div>
	);
};

function LinkBuilder() {
	const [query, setQuery] = useState("");
	const [potentialCollocations, setPotentialCollocations] =
		useState<CollocationList>([]);
	const [linkWords, setLinkWords] = useState<CollocationList>([]);
	const [sliderValue, setSliderValue] = useState(5000);
	const [selectedRelation, setSelectedRelation] = useState("");

	const activeLink = linkWords.length !== 0;
	const impossibleLink = activeLink && potentialCollocations.length === 0;

	const parseCollocationResponse = (
		response: CollocationsResponse[]
	): string[] => {
		const potentialCollocations: string[] = [];

		response.forEach((potentialCollocation) => {
			const { basisword, collocation, relation } = potentialCollocation;
			const collocationWords = collocation.split(" ");

			//need to add logic for all relations or most likely we 
			//need to just filter out the ones that don't work very well
			switch (relation) {
				case LinguisticPatterns.N_NN_N:
					if (collocationWords[0] === basisword) potentialCollocations.push(collocationWords[1]);
					break;
				default:
					potentialCollocations.push(collocationWords[0]);
					break;
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
				relation: selectedRelation,
				min_sig: sliderValue.toString(),
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

			setPotentialCollocations(parseCollocationResponse(response.data));
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

	const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value }: { value: TargetValue } = e.target;
		const parsedValue = parseInt(value);
		setSliderValue(parsedValue);
	};

	const handleRelationChange = (e: ChangeEvent<HTMLSelectElement>) => {
		const { value }: { value: TargetValue } = e.target;
		setSelectedRelation(value);
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

						<SliderComponent
							sliderValue={sliderValue}
							handleSliderChange={handleSliderChange}
						/>

						<RelationSelector 
							selectedRelation={selectedRelation}
							handleRelationChange={handleRelationChange}/>

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

export default LinkBuilder;
