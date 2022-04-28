/**
 * File contains TextSelector component responsible for searching and selecting approved inputs.
 *
 * @author Hugo Ekstrand
 */

import { toLower, map } from "ramda"
import { FC, useState } from "react"

/**
 * @field placeholder - Placeholder for input
 * @field selectables - Approved inputs
 * @field onChange    - Callback for when input changes
 */
 type TSelectorData = {
    placeholder?: string
    selectables: string[]
    onChange: (str: string) => void
}
const TextSelector: FC<TSelectorData> = ({placeholder, selectables, onChange}) => {
    // User text input value
    let [inputValue, inputSetter] = useState("");
    // All current predictions
    let [predictionsValue, predictionsSetter]  = useState(['']);
    // Index for the prediction. Note: -1 is for no prediction selected.
    let [predictionIndex, setPredictionIndex] = useState(-1);
    function onKeyDown(ev: React.KeyboardEvent<HTMLInputElement>){
        if(ev.key === "ArrowDown"){
            setPredictionIndex(Math.min(predictionIndex + 1, predictionsValue.length - 1));
        }
        if(ev.key === "ArrowUp"){
            setPredictionIndex(Math.max(predictionIndex - 1,-1));
        }
        if(ev.key === "Enter" && predictionIndex !== -1){
            onInputChange(predictionsValue[predictionIndex]);
        }
        console.log("Selected " + predictionIndex + ", " + predictionsValue[predictionIndex])
    }
    function onInputChange(str: string){
        inputSetter(str);
        predictionsSetter(str !== '' ? predictions(str, selectables) : []);
        setPredictionIndex(-1);

        // Only if it is a valid string do we notify listener. 
        if(selectables.includes(str))
            onChange(str);
    }
    return (
        <div className='group relative dropdown  px-4 cursor-pointer font-bold tracking-wide'>
            <input className='input text-lg' autoComplete='true' placeholder={placeholder} value={inputValue}
            onChange={ev => onInputChange(ev.target.value)} onKeyDown={onKeyDown}/>
            <div className="group-hover:block dropdown-menu absolute hidden h-auto border-2 rounded z-20 bg-white" role="menu">
                {
                    predictionsValue.filter(s => s !== "").map((itm, i) => (
                        <li className={"text-gray-700 block px-4 py-2 text-sm hover:bg-gray-400 border-b-2 rounded z-20" + (i == predictionIndex ? " bg-red-200 border-red-400" : "")} role="menuitem" 
                            key={i + '_' + itm}
                            onClick={_ => onInputChange(itm)} >
                            {itm}
                        </li>
                    ))
                }
            </div>
        </div>
    );
}
/**
 * Returns a list of predictions given a partial string input and a collection of allowed predictions.
 * @param partial - The partial string which will be predicted of.
 * @param collection - The allowed predictions
 * @returns the subset of allowed predictions which are predictions to the given partial string.
 */
function predictions(partial: string, collection: string[]): string[] {
    // TODO: Cleanup or change prediction
    // Currently it matches on every word in the string.
    // E.g. partial match of the second word in a string in collection
    // Or the second word in partial could match a string in collection

	const lowerPartial = toLower(partial);	// Lowercase version of search input to compare against
	const partialLen = lowerPartial.length;	// Length of search input
	let result: string[] = [];	// List of matching search results

	for (var str of collection) {
		const len = str.length;
		const lowerStr = toLower(str);

		for (let i = 0; i < len; i++) {
			if (i + partialLen > len) {
				// We've gone too far
				break;
			}

			const subStr = str.substring(i, i + partialLen);

			if (subStr === lowerPartial) {
				// Found a match! Add it to the list.
				result.push(str);
				break;
			}
		}
	}

	return result;

    //return collection
    //    .filter(str => str.toLowerCase() !== partial.toLowerCase())
    //    .filter(str =>
    //        str.toLowerCase()
    //            .split(' ') // We want to match any word. E.g. surnames and first name
    //            .filter(sp =>
    //                partial.toLowerCase().split(' ').filter(p => sp.startsWith(p)).length > 0).length > 0);
}
export default TextSelector