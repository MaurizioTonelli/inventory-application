var Author = require("../models/author");
var Project = require("../models/project");
var Technology = require("../models/technology");
var async = require("async");
const { body, validationResult } = require("express-validator");

exports.index = function (req, res, next) {
  async.parallel(
    {
      projectCount: function (callback) {
        Project.countDocuments({}, callback);
      },
      technologyCount: function (callback) {
        Technology.countDocuments({}, callback);
      },
      authorCount: function (callback) {
        Author.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Project library Home",
        error: err,
        data: results,
      });
    }
  );
};

exports.project_list = function (req, res, next) {
  Project.find({})
    .populate("author")
    .populate("technologies")
    .exec(function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("project_list", {
        title: "List of projects",
        projects: results,
      });
    });
};

exports.project_detail = function (req, res) {
  Project.findById(req.params.id)
    .populate("author")
    .populate("technologies")
    .exec(function (err, project) {
      if (err) {
        return next(err);
      }
      res.render("project_detail", {
        title: "Project detail page",
        project: project,
      });
    });
};
exports.project_create_get = function (req, res, next) {
  async.parallel(
    {
      authors: function (callback) {
        Author.find({}).exec(callback);
      },
      technologies: function (callback) {
        Technology.find({}).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("project_form", {
        title: "Create new project",
        authors: results.authors,
        technologies: results.technologies,
      });
    }
  );
};

exports.project_create_post = [
  body("title", "Project title is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author is required").trim().isLength({ min: 1 }).escape(),
  body("technologies.*").escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var project = new Project({
      title: req.body.title,
      author: req.body.author,
      technologies: req.body.technologies,
    });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: function (callback) {
            Author.find({}).exec(callback);
          },
          technologies: function (callback) {
            Technology.find({}).exec(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          res.render("project_form", {
            title: "Create new project",
            project: project,
            authors: results.authors,
            technologies: results.technologies,
          });
        }
      );
      return;
    } else {
      project.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(project.url);
      });
    }
  },
];
exports.project_delete_get = function (req, res, next) {
  Project.findById(req.params.id).exec(function (err, project) {
    if (err) {
      return next(err);
    }
    res.render("project_delete", { title: "Delete project", project: project });
  });
};

exports.project_delete_post = function (req, res) {
  Project.findByIdAndRemove(req.body.projectid, function deleteProject(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/catalog/projects");
  });
};

exports.project_update_get = function (req, res) {
  async.parallel(
    {
      project: function (callback) {
        Project.findById(req.params.id)
          .populate("author")
          .populate("technologies")
          .exec(callback);
      },
      authors: function (callback) {
        Author.find(callback);
      },
      technologies: function (callback) {
        Technology.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.project == null) {
        var err = new Error("Project not found");
        err.status = 404;
        return next(err);
      }
      for (
        var all_t_iter = 0;
        all_t_iter < results.technologies.length;
        all_t_iter++
      ) {
        for (
          var project_t_iter = 0;
          project_t_iter < results.project.technologies.length;
          project_t_iter++
        ) {
          if (
            results.technologies[all_t_iter]._id.toString() ===
            results.project.technologies[project_t_iter]._id.toString()
          ) {
            results.technologies[all_t_iter].checked = "true";
          }
        }
      }
      res.render("project_form", {
        title: "Update Project",
        authors: results.authors,
        technologies: results.technologies,
        project: results.project,
      });
    }
  );
};

exports.project_update_post = [
  (req, res, next) => {
    if (!(req.body.technologies instanceof Array)) {
      if (typeof req.body.technologies === "undefined")
        req.body.technologies = [];
      else req.body.technologies = new Array(req.body.technologies);
    }
    next();
  },
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("technologies.*").escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    var project = new Project({
      title: req.body.title,
      author: req.body.author,
      technologies:
        typeof req.body.technologies === "undefined"
          ? []
          : req.body.technologies,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          technologies: function (callback) {
            Technology.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }
          for (let i = 0; i < results.technologies.length; i++) {
            if (project.technology.indexOf(results.technologies[i]._id) > -1) {
              results.technologies[i].checked = "true";
            }
          }
          res.render("project_form", {
            title: "Update Project",
            authors: results.authors,
            technologies: results.technologies,
            project: project,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Project.findByIdAndUpdate(
        req.params.id,
        project,
        {},
        function (err, theproject) {
          if (err) {
            return next(err);
          }
          res.redirect(theproject.url);
        }
      );
    }
  },
];
