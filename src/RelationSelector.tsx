import { ChangeEvent } from "react";
import { LinguisticPatterns } from "./constants/LinguisticPatterns";

type RelationProps = {
	selectedRelation: string;
	handleRelationChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

function RelationSelector({ selectedRelation, handleRelationChange }: RelationProps) {
	return (
		<select
			style={{ marginTop: "50px" }}
			value={selectedRelation}
			onChange={handleRelationChange}
		>
			<option value="">Select a relation</option>
			{Object.values(LinguisticPatterns).map((value, index) => (
				<option key={value} value={value}>
					{index + 1}. {value}
				</option>
			))}
		</select>
	);
}

export default RelationSelector;
