var Technology = require("../models/technology");
var Project = require("../models/project");
var async = require("async");
const { body, validationResult } = require("express-validator");
const technology = require("../models/technology");

exports.technology_list = function (req, res, next) {
  Technology.find({}).exec(function (err, technology_list) {
    if (err) {
      return next(err);
    }
    res.render("technology_list", {
      title: "List of technologies",
      technologies: technology_list,
    });
  });
};
exports.technology_detail = function (req, res, next) {
  async.parallel(
    {
      technology: function (callback) {
        Technology.findById(req.params.id).exec(callback);
      },
      technology_projects: function (callback) {
        Project.find({ technologies: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("technology_detail", {
        title: "Technology detail page",
        technology: results.technology,
        technology_projects: results.technology_projects,
      });
    }
  );
};
exports.technology_create_get = function (req, res) {
  res.render("technology_form", { title: "Create new technology" });
};
exports.technology_create_post = [
  body("name", "Name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var technology = new Technology({
      name: req.body.name,
      description: req.body.description,
    });
    if (!errors.isEmpty()) {
      res.render("technology_form", {
        title: "Create new technology",
        technology: technology,
        errors: errors.array(),
      });
      return;
    } else {
      Technology.findOne({ name: req.body.name }).exec(function (
        err,
        technology_found
      ) {
        if (err) {
          return next(err);
        }
        if (technology_found) {
          res.redirect(technology_found.url);
        } else {
          technology.save(function (err) {
            if (err) {
              return next(err);
            }
            res.redirect(technology.url);
          });
        }
      });
    }
  },
];
exports.technology_delete_get = function (req, res, next) {
  async.parallel(
    {
      technology: function (callback) {
        Technology.findById(req.params.id).exec(callback);
      },
      technology_projects: function (callback) {
        Project.find({ technologies: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("technology_delete", {
        title: "Delete Technology",
        technology: results.technology,
        technology_projects: results.technology_projects,
      });
    }
  );
};
exports.technology_delete_post = function (req, res) {
  async.parallel(
    {
      technology: function (callback) {
        Technology.findById(req.params.id).exec(callback);
      },
      projects: function (callback) {
        Project.find({ technologies: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.projects.length > 0) {
        res.render("technology_delete", {
          title: "Delete technology",
          technology: results.technology,
          technology_projects: results.projects,
        });
      } else {
        Technology.findByIdAndRemove(
          req.body.technologyid,
          function deleteTechnology(err) {
            if (err) {
              return next(err);
            }
            res.redirect("/catalog/technologies");
          }
        );
      }
    }
  );
};
exports.technology_update_get = function (req, res) {
  Technology.findById(req.params.id).exec(function (err, technology) {
    if (err) {
      return next(err);
    }
    if (technology == null) {
      var err = new Error("Technology not found");
      err.status = 404;
      return next(err);
    }
    res.render("technology_form", {
      title: "Update Technology",
      technology: technology,
    });
  });
};
exports.technology_update_post = [
  body("name", "Technology name required").trim().isLength({ min: 1 }).escape(),
  body("description", "Technology description required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    var technology = new Technology({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      Technology.findById(req.params.id).exec(function (err, technology) {
        if (err) {
          return next(err);
        }
        if (technology == null) {
          var err = new Error("Technology not found");
          err.status = 404;
          return next(err);
        }
        res.render("technology_form", {
          title: "Update Technology",
          technology: technology,
          errors: errors.array(),
        });
      });
      return;
    } else {
      Technology.findByIdAndUpdate(
        req.params.id,
        technology,
        {},
        function (err, thetechnology) {
          if (err) {
            return next(err);
          }
          res.redirect(thetechnology.url);
        }
      );
    }
  },
];
