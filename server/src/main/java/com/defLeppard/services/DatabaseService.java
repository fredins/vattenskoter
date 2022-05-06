package com.defLeppard.services;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;
import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.stereotype.Service;

/**
 *
 * Service for reading a JSON-file and converting the JSON objects to java object,
 * database-queries, inserts into the database and other database related actions.
 *
 *
 * @author William Schmitz, Jonas Röst
 */
@Service
public
class DatabaseService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     *
     * Inserts students into the database
     * @param jsonArray the json array as a Java string that contains the students that should be inserted into the database
     * @return the number of rows affected in the database
     *
     */
    public int addStudentsToDatabase(String jsonArray) throws IOException {
        List<Student> studentList = Student.createStudents(jsonArray);
        return addStudents(studentList);
    }

    /**
     *
     * Inserts a student into the internal database
     * @param student the student who is to be inserted into the database.
     * @return the number of rows affected in the database
     *
     */
    private int addStudent(Student student) {

        String sqlStatement = "INSERT INTO Student VALUES ('" +student.getStudentEmail() + "', '" +student.getStudentName() + "')";

        int rowsAffected = jdbcTemplate.update(sqlStatement);

        return rowsAffected;
    }

    /**
     *
     * Inserts a list of students into the internal database
     * @param students the students which are to be inserted into the database.
     * @return the number of rows affected in the database
     *
     */
    private int addStudents(List<Student> students) {
        int totalRowsAffected = 0;

        for (Student student : students) {
            totalRowsAffected += addStudent(student);
        }

        return totalRowsAffected;
    }


    /**
     *
     * Inserts events into the database
     * @param jsonArray the json array as a Java string that contains the events that should be inserted into the database
     * @return the number of rows affected in the database
     *
     */
    public int addEventsToDatabase(String jsonArray) throws IOException {
        List<Event> eventList = Event.createEvents(jsonArray);
        return addEvents(eventList);
    }

    /**
     *
     * Inserts an event into the internal database
     * @param event the event which is to be inserted into the database.
     * @return the number of rows affected in the database
     *
     */
    private int addEvent(Event event) {

        String sqlStatement = "INSERT INTO Session VALUES ('" +event.getEventIdnr() + "', '" +event.getEventTitle() + "', '" +event.getEventFromDate() +
                "', '" +event.getEventToDate() + "', '" +event.getEventLocation() + "')";

        int rowsAffected = jdbcTemplate.update(sqlStatement);

        return rowsAffected;
    }


    /***
     *
     * Inserts a list of events into the internal database
     * @param events list of events to be inserted into the database
     * @return the number of rows affected in the database
     *
     */
    private int addEvents(List<Event> events) {
        int totalRowsAffected = 0;

        for (Event event : events) {
            totalRowsAffected += addEvent(event);
        }

        return totalRowsAffected;
    }

    /**
     *
     * Inserts instructors into the database
     * @param jsonArray the json array as a Java string that contains the instructors that should be inserted into the database
     * @return the number of rows affected in the database
     *
     */
    public int addInstructorsToDatabase(String jsonArray) throws IOException {
        List<Instructor> instructorList = Instructor.createInstructors(jsonArray);
        return addInstructors(eventList);
    }

    /**
     *
     * Inserts an instructor into the internal database
     * @param instructor the instructor who is to be inserted into the database.
     * @return the number of rows affected in the database
     *
     */
    private int addInstructor(Instructor instructor) {

        String sqlStatement = "INSERT INTO Instructor VALUES ('" +instructor.getName() + "')";

        int rowsAffected = jdbcTemplate.update(sqlStatement);

        return rowsAffected;
    }


    /***
     *
     * Inserts a list of events into the internal database
     * @param events list of events to be inserted into the database
     * @return the number of rows affected in the database
     *
     */
    private int addInstructors(List<Instructor> instructors) {
        int totalRowsAffected = 0;

        for (Instructor instructor : instructors) {
            totalRowsAffected += addInstructor(instructor);
        }

        return totalRowsAffected;
    }

    /***
     *
     * Fetch all rows from the table Student in the database
     * @return the list of all students as Student objects that exist in the database
     *
     */
    public static List<Student> fetchAllStudents() {
        String sqlQuery = "SELECT * FROM Student";

        List<Student> allStudents = jdbcTemplate.query(sqlQuery,new BeanPropertyRowMapper<>(Student.class));

        return allStudents;
    }

    /***
     *
     * Fetch a student from the database that matches the given email
     * @param studentEmail email of the student that is being queried for
     * @return the student with the given email, as type Student
     *
     */
    public static Student fetchOneStudent(String studentEmail) throws EmptyResultDataAccessException {
        String sqlQuery = "SELECT * FROM Student WHERE email = ?";
        return jdbcTemplate.queryForObject(sqlQuery, new Object[]{studentEmail}, new BeanPropertyRowMapper(Student.class));
    }

    /***
     *
     * Fetch all rows from the table Session in the database
     * @return the list of all events as Event objects that exist in the database
     *
     */
    public static List<Event> fetchAllEvents() {
        String sqlQuery = "SELECT * FROM Session";

        List<Event> allEvents = jdbcTemplate.query(sqlQuery,new BeanPropertyRowMapper<>(Event.class));

        return allEvents;
    }

    /***
     *
     * Fetch events from the database that are scheduled in a specified interval
     * @param from start date of the inverval
     * @param to end date of the interval
     * @return the events within the given interval
     *
     */
    public static List<Event> fetchEventsInIntervall(Timestamp from, Timestamp to) throws EmptyResultDataAccessException  {
        String sqlQuery = "SELECT * FROM Session WHERE (fromdate < ? AND todate > ?";

        List<Event> events = jdbcTemplate.query(sqlQuery, new BeanPropertyRowMapper(Event.class), from, to);

        return events;
    }


    /***
     *
     * Fetch all rows from the table Instructors in the database
     * @return the list of all instructors as Instructor objects that exist in the database
     *
     */
    public static List<Instructor> fetchAllInstructors() {
        String sqlQuery = "SELECT * FROM Instructor";

        List<Instructor> allInstructors = jdbcTemplate.query(sqlQuery,new BeanPropertyRowMapper<>(Instructor.class));

        return allInstructors;
    }


    /***
     *
     * Fetch a student from the database that matches the given email
     * @param studentEmail email of the student that is being queried for
     * @return the student with the given email, as type Student
     *
     */
    public static Instructor fetchOneInstructor(String instructorName) {
        String sqlQuery = "SELECT * FROM Instructor WHERE name = ?";
        try {
           Instructor instructor = jdbcTemplate.queryForObject(sqlQuery, new Object[]{instructorName}, new BeanPropertyRowMapper(Instructor.class));
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
        return instructor;
    }

}