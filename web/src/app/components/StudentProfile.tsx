import { zipWith } from 'ramda';
import { FC } from 'react'
import { StudentEducationalMomentsData } from '../../types/types';
import { useNavigate } from "react-router-dom";
import studentProfileData from '../sData';

// Creates a button that makes the user go back one step in their history.
function NavigateBack() {
  const navigate = useNavigate();
  return (
      <button onClick={() => navigate(-1)}>Back</button>
  );
}
//Completed version should submit the finished moments to the database accordingly.
function submitInfo(){}



// Converts an array of strings to an HTML list of those strings as well as a check box. 
// Needs to fix checked={} onChange={} functions where if you press Save on 
function listMoments(arr: string[]) {
	return(
    <div>
      <ol>
        {createMoments(arr)}
      </ol>
    </div>
  );
}

function createMoments(arr: string[]) {
  return(
    <>{zipWith((x, k) => <li key={k} className="mb-0.5"><input type="checkbox" value={x} className="mr-0.5"></input>{x}</li>, arr, Array.from(Array(arr.length).keys())) }</>
  );
}

const StudentProfile : FC<StudentEducationalMomentsData> = data =>{
  return (
    <div className="flex flex-col">
      <div>{NavigateBack()}</div>
      <div  className="text-center mb-4">
        <h1 className="text-xl font-bold text-4xl my-4">{data.student}</h1>
        <p>{data.email}</p>
      </div>
      <p className="font-bold">Utbildningsmoment:</p>
      <ol>{listMoments(data.educationalMoments)}</ol>
      <div className="px-24 flex flex-col content-center">
        <button type="submit" onSubmit={submitInfo} className="w-16 h-5 rounded-md text-center bg-cyan-500 hover:bg-cyan-600 ">Save</button>
      </div>
    </div>
  )
}


export default StudentProfile;
