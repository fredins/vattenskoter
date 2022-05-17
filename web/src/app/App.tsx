/** 
 *  File contains the root component and utilities 
 *  regarding routing and querying.
 * 
 */
import { useReducer } from 'react'
import Session from './components/Session';
import SessionEditor from './components/SessionEditor';
import NotFound from './components/NotFound';
import StudentProfile from './components/StudentProfile';
import Calendar from './components/Calendar';
import { LocationState, SessionData, StudentData } from '../types/types';
import { CalendarState } from 'react-awesome-calendar'
import { find } from 'ramda'
import {
  Routes,
  Route,
  useParams,
  useLocation,
  Params,
  Navigate,
} from "react-router-dom";
import { useQuery, useQueryClient } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { getEvents } from './apis/EventApi'
import { getStudents } from './apis/StudentApi';

/**
 * Root component of the app
 * 
 * @remarks
 * 
 * App tries to be relatively small, but since it is the root 
 * component it is suitable for facilitate communication 
 * — between components — and handle global state.
 * 
 */
function App() {
  const location = useLocation()
  const state = location.state as Partial<LocationState>
  const queryClient = useQueryClient()

  /**
   * Reducer for fetching new events on year onChange
   * 
   * @remarks 
   *
   * It keeps track of selected year and invalidates
   * the event query on year change
   * @see {@link https://react-query.tanstack.com/guides/query-invalidation}
   * @see {@link https://reactjs.org/docs/hooks-reference.html#usereducer}
   */
  const [year, dispatch] = useReducer(
    (prevYear: number, newYear: number) => {
      if (prevYear !== newYear)
        queryClient.invalidateQueries('events')
      return newYear
    }
    , new Date().getFullYear())


  /**
   * Queries events and display and returns early if loading or error
   *
   * @remarks staleTime is used extended (from 0) to avoid refetching.
   *  
   * @see {@link https://react-query.tanstack.com/reference/useQuery}
   * @see {@link https://react-query.tanstack.com/guides/initial-query-data#staletime-and-initialdataupdatedat}
   */
  
  const { isLoading, error, data } =
    useQuery<SessionData[], Error>('events', () => getEvents(year), { staleTime: 600000 })
  const {data:sdata} = useQuery<StudentData[]>('student', () => getStudents(), { staleTime: 600000});
  if (isLoading) return <p className='text-center p-10'>Loading...</p>
  if (error) return (
    <p className='text-center p-10'>
      An error has occurred: {error.message}
    </p>)
  const sessions = data!
  const sprofile = sdata!
    
  return (
    <>
      <Routes>
        { /* Routes to normal fullscreen views */}
        <Route path="/" element={<Cal />} />
        <Route path="*" element={<NotFound />} />
        { /* Routes to modal views */}
        {RouteCalendarModal("/newsession")}
        {RouteCalendarModal("session/:id")}
        {RouteCalendarModal("session/:id/edit")}
        {RouteCalendarModal("session/:id/:student")}
      </Routes>

      {
        /* Shows the modal pane whenever the background property 
         * of the location state is defined.
         */
      }
      {state?.background && (
        <Routes>
          <Route path="/newsession" element={<NewSession />} />
          <Route path="/session/:id" element={<ViewSession />} />
          <Route path="/session/:id/edit" element={<EditSession />} />
          <Route path="/session/:id/:student" element={<StudentProfile name='Alice Andersson' email='AliceA@outlook.com'/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      <ReactQueryDevtools />
    </>
  );


  /**
   *  Wrapper for Calendar
   */
  function Cal() {
    return <Calendar sessions={sessions} onChange={(state: CalendarState) => dispatch(state.year)} />
  }


  /**
   * Route for modal components that wants the calendar 
   * in the background
   * 
   * @param path - The url path  
   * 
   * @remarks  
   * 
   * Sets the background property of location state to the 
   * calendar and then navigate to the same url path, assuming
   * the background property isn't already present.
   *
   * @see {@link https://reactrouter.com/docs/en/v6/api#navigate}
   * @see {@link https://github.com/remix-run/history/blob/main/docs/api-reference.md#location}
   * 
   */
  function RouteCalendarModal(path: string) {
    return (<Route path={path}
      element={state?.background ?
        <Cal /> :
        <Navigate
          to={location.pathname}
          state={{ ...state, background: location }} />}
    />)
  }

  /** 
   * Wrapper for SessionEditor
   *
   * @remarks
   * 
   * This is intended for when a users wants to edit an existing session, 
   * which is why it sets the right value of Either<CalendarDate, SessionData>.
   */
  function EditSession() {
    return WithParam<Number>(checkIdParam, id => {
      const session = find(e => e.id === id, sessions)
      return session === undefined ? undefined : <SessionEditor {...{ right: session }} />
    })
  }

  /** 
   * Wrapper for Session
   *
   * @remarks 
   *  
   * Matches the id in the url params with the corresponding session.
   */
  function ViewSession() {
    return WithParam<Number>(checkIdParam, id => {
      const session = find(e => e.id === id, sessions)
      return session === undefined ? undefined : <Session {...session} />
    })
  }
  /*TODO:
  Sätta in {...profile, email:student, name:__} i ViewProfile. 
  Kanske göra om Listmoments i Studentprofile
  Fixa en fetch och sätta in email och namn. Möjligvis fetcha studentData och hitta den istället. Då blur studentProfile istället en FC med studentdata som data.
  därefter kan man fetcha moments baserat på datan från fetch.
  Ha funktion i studentprofile som mixar ihop datan från StudentData med det man får från fetchen.
  Det behövs nog ingen ny typ som ska ersätta studenteducationalmoments eftersom det är isolerad användning innanför studentProfile och måste därmed inte matcha någon datatyp.
  */
 /*
  function ViewProfile(){
    return WithParam<String>(checkStringParam, student => {
      const profile = find(e => e.email === student, studentProfileData)
      return profile === undefined ? undefined : <StudentProfile {...profile} />
    })
  }*/
  function ViewProfile(){
    return WithParam<String>(checkStudentParam, student => {
      const profile = find(e => e.email === student, sprofile) 
      return profile === undefined ? undefined : <StudentProfile {...profile} />
    })
  }

}

/** 
 * Wrapper for SessionEditor
 *
 * @remarks
 * 
 * This is intended for when a users wants to create a new session, 
 * which is why it sets the left value of Either<CalendarDate, SessionData>.
 *
 * @see {@link https://reactrouter.com/docs/en/v6/api#uselocation}
 */
function NewSession() {
  return <SessionEditor {...{ left: (useLocation().state as LocationState).date }} />
}

/** 
 * Checks if the url params contains an id, which
 * is a number.
 *
 * @param params - Url parameters
 */
function checkIdParam(params: Readonly<Params<string>>): Number | undefined {
  const id = params.id
  return (id === undefined || isNaN(+id)) ? undefined : parseInt(id)
}
/**
 * 
 * @param params 
 * @returns 
 */
function checkStudentParam(params: Readonly<Params<string>>): String | undefined{
  const student = params.student
  return (student)
}

/**
 * HOC that generalise the task of checking and extracting the url params
 * 
 * @param f - Function that takes an params and return a maybe value of type T
 * @param g - Component that takes T as props
 * @typeParam T - Type of g's props
 *  
 * @see {@link https://reactjs.org/docs/higher-order-components.html}
 * @see {@link https://reactrouter.com/docs/en/v6/api#useparams}
 */
function WithParam<T>(f: (params: Readonly<Params<string>>) => T | undefined, g: (t: T) => JSX.Element | undefined): JSX.Element {
  const x = f(useParams())
  if (x === undefined)
    return <NotFound />
  const comp = g(x)
  if (comp === undefined)
    return <NotFound />
  return comp
}

export default App;
