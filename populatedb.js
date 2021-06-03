#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Project = require("./models/project");
var Author = require("./models/author");
var Technology = require("./models/technology");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var authors = [];
var technologies = [];
var projects = [];

function authorCreate(name, cb) {
  authordetail = { name: name };

  var author = new Author(authordetail);

  author.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Author: " + author);
    authors.push(author);
    cb(null, author);
  });
}

function technologyCreate(name, description, cb) {
  var technology = new Technology({ name: name, description: description });

  technology.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Genre: " + technology);
    technologies.push(technology);
    cb(null, technology);
  });
}

function projectCreate(title, author, technology, cb) {
  projectdetail = {
    title: title,
    author: author,
  };
  if (technology != false) projectdetail.technology = technology;

  var project = new Project(projectdetail);
  project.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New project: " + project);
    projects.push(project);
    cb(null, project);
  });
}

function createTechnologyAuthors(cb) {
  async.series(
    [
      function (callback) {
        authorCreate("Patrick12", callback);
      },
      function (callback) {
        authorCreate("BenTeacher", callback);
      },
      function (callback) {
        authorCreate("IsaacTheMaster", callback);
      },
      function (callback) {
        authorCreate("Bob Sapp", callback);
      },
      function (callback) {
        authorCreate("Jon Jones", callback);
      },
      function (callback) {
        technologyCreate(
          "React",
          "A Facebook made frontend framework",
          callback
        );
      },
      function (callback) {
        technologyCreate("MongoDB", "A NoSQL database", callback);
      },
      function (callback) {
        technologyCreate(
          "Python",
          "A general purpose programming language",
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createProjects(cb) {
  async.parallel(
    [
      function (callback) {
        projectCreate(
          "Basic React website",
          authors[0],
          [technologies[0]],
          callback
        );
      },
      function (callback) {
        projectCreate(
          "Javascript basic project right now",
          authors[1],
          [technologies[0], technologies[1]],
          callback
        );
      },
      function (callback) {
        projectCreate(
          "Data recopilator in python",
          authors[2],
          [technologies[2]],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createTechnologyAuthors, createProjects],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Projects: " + projects);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
