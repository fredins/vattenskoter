
-- This script deletes everything in your database
\set QUIET true
SET client_min_messages TO WARNING; 
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
\set QUIET false



\ir database.sql