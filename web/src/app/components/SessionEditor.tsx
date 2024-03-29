import { useReducer, useState } from 'react';
import { CalendarDate } from 'react-awesome-calendar'
import { SessionData, Either, Student, Instructor } from '../../types/types'
import MultiInput from './MultiInput'
import { FaLongArrowAltRight } from 'react-icons/fa'
import { getStudents } from '../apis/StudentApi';
import { ServerURL } from '../apis/URIs';
import { getInstructors } from '../apis/InstructorApi';
import { useNavigate } from 'react-router-dom'
import { map, filter } from 'ramda';
import { useQuery, useQueryClient } from 'react-query'
import { lefts, rights } from '../helpers/Helpers'

/**
 * Component for creating and editing sessions
 * 
 * @param props
 * @param props.left - Initial date of the new event
 * @param props.right - Data of an existing session
 */
function SessionEditor({ left, right }: Either<CalendarDate, SessionData>) {
  if (right !== undefined)
    return (<Form {...right} />)

  /* Create Date fom CalendarDate */
  const { year, month, day, hour } = left
  const min = hour % 1 * 60
  return (
    <Form
      id={0}
      title=""
      location=""
      from={new Date(year, month, day, hour, min)}
      to={new Date(year, month, day, hour + 2, min)}
      instructors={[]}
      participants={[]}
    />
  )
}

/**
 * Component for input of session information
 * 
 * @param initState
 */
function Form(initState: SessionData) {
  const navigate = useNavigate()
  const [state, dispatch] = useReducer(
    (prevState: SessionData, newFields: Partial<SessionData>) => ({ ...prevState, ...newFields })
    , initState)
  const [fromDate, setFromDate] = useState(dateStr(initState.from))
  const [toDate, setToDate] = useState(fromDate)
  const [title, setTitle] = useState(state.title);
  const { data } = useQuery<{ students: Student[], instructors: Instructor[] }, Error>(
    'student-instructor-names'
    , async () => ({ students: await getStudents(), instructors: await getInstructors() })
    , { staleTime: 600000 })

  const queryClient = useQueryClient();
  const students = data ? map(studentToEither, listDiff(data.students, state.participants)) : []
  const instructors = data ? map(instructorToEither, listDiff(data.instructors, state.instructors)) : []

  return (
    <div className='fixed inset-0 z-[15] mt-10 overflow-y-auto'>
      <div
        className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
        onClick={() => navigate('/')}
      />
      <div className='absolute inset-0 mx-auto z-20 w-full md:w-fit md:h-fit'>
        <div className='card-modal-add'>
          <div className='flex flex-col'>
            <div className="border-b-2 border-light-secondary border-opacity-20 pb-5">
              <h1 className="title-page">Lägg till uppkörningstillfälle</h1>
            </div>
            <div className='flex-row justify-between mt-5 mb-1 '>
              <input className='input' name='title' type="text" placeholder="Titel" value={title} onChange={e => {dispatch({title: e.target.value}); setTitle(e.target.value)}} />
            </div>

            <div className='flex-row justify-between mt-1 mb-3 border-b-2 border-light-secondary border-opacity-20 pb-4'>
              <input className='input' name='place' type="text" placeholder="Plats" value={state.location} onChange={e => dispatch({ location: e.target.value })} />
            </div>

            <p className='title-content'>Datum</p>
            <div className='flex mt-1 mb-3 border-b-2 border-light-secondary border-opacity-20 pb-4 items-center justify-between' >
              <input
                className='input'
                name='from'
                type="date"
                value={fromDate}
                onChange={e => {
                  setFromDate(e.target.value)
                  const y = parseInt((e.target.value).substring(0, 4))
                  const m = parseInt((e.target.value).substring(5, 7))
                  const d = parseInt((e.target.value).substring(8, 10))
                  const date = state.from
                  date.setFullYear(y)
                  date.setMonth(m - 1)
                  date.setDate(d)
                  dispatch({ from: new Date(date) })
                }}

              />
              <FaLongArrowAltRight className='inline fill-light-secondary ml-2 mr-2' />
              <input
                className='input'
                name='to'
                type="date"
                min={fromDate}
                value={toDate}
                onChange={e => {
                  setToDate(e.target.value)
                  const y = parseInt((e.target.value).substring(0, 4))
                  const m = parseInt((e.target.value).substring(5, 7))
                  const d = parseInt((e.target.value).substring(8, 10))
                  const date = state.to
                  date.setFullYear(y)
                  date.setMonth(m - 1)
                  date.setDate(d)
                  dispatch({ to: new Date(date) })
                }}

              />
            </div>

            <p className='title-content'>Tid</p>
            <div className='flex mt-1 mb-3 border-b-2 border-light-secondary border-opacity-20 pb-4 items-center justify-between' >
              <input
                className='input'
                name='from'
                type="time"
                defaultValue={timeStr(initState.from)}
                onChange={e => {
                  const h = parseInt((e.target.value).substring(0, 2))
                  const m = parseInt((e.target.value).substring(3, 5))
                  const d = state.from
                  d.setHours(h)
                  d.setMinutes(m)
                  dispatch({ from: new Date(d) })
                }}
              />
              <FaLongArrowAltRight className='inline fill-light-secondary ml-2 mr-2' />
              <input
                className='input'
                name='to'
                type='time'
                defaultValue={timeStr(initState.to)}
                onChange={e => {
                  const h = parseInt((e.target.value).substring(0, 2))
                  const m = parseInt((e.target.value).substring(3, 5))
                  const d = state.to
                  d.setHours(h)
                  d.setMinutes(m)
                  dispatch({ to: new Date(d) })
                }}
              />
            </div>

            <div className='mt-1 mb-3 border-b-2 border-light-secondary border-opacity-20 pb-4'>
              <label
                className='title-content'
                htmlFor="instructors">
                Instruktörer:
              </label>
              <MultiInput
                options={instructors}
                defaultValue={map(instructorToEither, state.instructors)}
                placeholder='Lägg till en instruktör'
                onChange={is => dispatch({ instructors: rights(is) })}
              />
            </div>
            <div className='mt-1 mb-1'>
              <label className='title-content' htmlFor="students">Elever: </label>
              <MultiInput
                options={students}
                defaultValue={map(studentToEither, state.participants)}
                placeholder='Lägg till en elev'
                onChange={ss => dispatch({ participants: lefts(ss) })
                }
              />
            </div>
          </div>

          <div className='flex flex-col space-y-2 mt-10'>
            <button
              className='button-solid'
              type='submit'
              onClick={() => {
                fetch(`${ServerURL}/events/newsession`,
                  {
                    method: 'POST'
                    , headers:
                      { 'Content-Type': "application/json" }
                    , body: JSON.stringify({ ...state, id: state.id === 0 ? getRandomInt(1,999999999) : state.id })
                  })
                  .then(response => {
                    if (response.status === 200) { 
                      queryClient.invalidateQueries('events')
                      navigate(state.id > 0 ? "/session/" + state.id : '/')}
                    else { alert("Something went wrong! Your event was not saved.") }
                  })
              }
              }
            > Spara
            </button>
            <button
              className='button-outline'
              onClick={() => {
                navigate(state.id > 0 ? "/session/" + state.id : '/')
              }}
            > Avbryt
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}

/**
 * Converts Student to Either
 *
 * @param x - an Student
 *
 * @returns an Either with left: x
 */
function studentToEither(x: Student) {
  return { left: x }
}


/**
 * Converts Instructor to Either
 *
 * @param x - an Instructor
 *
 * @returns an Either with right: x
 */
function instructorToEither(x: Instructor) {
  return { right: x }
}

/**
 * Difference between two lists
 *
 * @param xs 
 * @param ys 
 *
 * @returns xs \ ys
 */
function listDiff<T>(xs: T[], ys: T[]) {
  return filter(x => !ys.includes(x), xs)
}

/** 
 * Map date to time in format 'hh:mm'
 * 
 * @param date   
 */
function timeStr(date: Date): string {
  return date.toTimeString().substring(0, 5)
}

/** 
 * Map date to date in format 'yyyy-mm-dd'
 * 
 * @param date   
 */
function dateStr(date: Date): string {
  return date.toISOString().substring(0, 10)
}

/**
 * Get random integer between two numbers
 * 
 * @param min 
 * @param max 
 * @returns Random integer between min and max
 */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); 
}

export default SessionEditor
