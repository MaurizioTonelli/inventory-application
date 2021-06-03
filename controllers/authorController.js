var Author = require("../models/author");
var Project = require("../models/project");
var async = require("async");
const { body, validationResult } = require("express-validator");

exports.author_list = function (req, res, next) {
  Author.find({}).exec(function (err, author_list) {
    if (err) {
      return next(err);
    }
    res.render("author_list", {
      title: "List of Authors",
      authors: author_list,
    });
  });
};
exports.author_detail = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_projects: function (callback) {
        Project.find({ author: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("author_detail", {
        title: "Author detail page",
        author: results.author,
        author_projects: results.author_projects,
      });
    }
  );
};
exports.author_create_get = function (req, res) {
  res.render("author_form", { title: "Create new author" });
};
exports.author_create_post = [
  body("name", "Author name required").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var author = new Author({ name: req.body.name });
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create new author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      Author.findOne({ name: req.body.name }).exec(function (
        err,
        found_author
      ) {
        if (err) {
          return next(err);
        }
        if (found_author) {
          res.redirect(found_author.url);
        } else {
          author.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect(author.url);
          });
        }
      });
    }
  },
];
exports.author_delete_get = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      projects: function (callback) {
        Project.find({ author: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("author_delete", {
        title: "Delete Author",
        author: results.author,
        author_projects: results.projects,
      });
    }
  );
};
exports.author_delete_post = function (req, res, next) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      projects: function (callback) {
        Project.find({ author: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.projects.length > 0) {
        res.render("author_delete", {
          title: "Delete author",
          author: results.author,
          author_projects: results.projects,
        });
      } else {
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) {
            return next(err);
          }
          res.redirect("/catalog/authors");
        });
      }
    }
  );
};
exports.author_update_get = function (req, res) {
  Author.findById(req.params.id).exec(function (err, author) {
    if (err) {
      return next(err);
    }
    if (author == null) {
      var err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    res.render("author_form", { title: "Update Author", author: author });
  });
};
exports.author_update_post = [
  body("name", "Author name required").trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var author = new Author({ name: req.body.name, _id: req.params.id });
    if (!errors.isEmpty()) {
      Author.findById(req.params.id).exec(function (err, author) {
        if (err) {
          return next(err);
        }
        if (author == null) {
          var err = new Error("Author not found");
          err.status = 404;
          return next(err);
        }
        res.render("author_form", {
          title: "Update Author",
          author: author,
          errors: errors.array(),
        });
      });
      return;
    } else {
      Author.findOne({ name: req.body.name }).exec(function (
        err,
        found_author
      ) {
        if (err) {
          return next(err);
        }
        if (found_author) {
          res.redirect(found_author.url);
        } else {
          Author.findByIdAndUpdate(
            req.params.id,
            author,
            {},
            function (err, theauthor) {
              if (err) {
                return next(err);
              }
              res.redirect(theauthor.url);
            }
          );
        }
      });
    }
  },
];
