var express = require("express");
var router = express.Router();

var authorController = require("../controllers/authorController");
var projectController = require("../controllers/projectController");
var technologyController = require("../controllers/technologyController");

router.get("/", projectController.index);

router.get("/authors", authorController.author_list);
router.get("/author/create", authorController.author_create_get);
router.post("/author/create", authorController.author_create_post);
router.get("/author/:id", authorController.author_detail);
router.get("/author/:id/delete", authorController.author_delete_get);
router.post("/author/:id/delete", authorController.author_delete_post);
router.get("/author/:id/update", authorController.author_update_get);
router.post("/author/:id/update", authorController.author_update_post);

router.get("/projects", projectController.project_list);
router.get("/project/create", projectController.project_create_get);
router.post("/project/create", projectController.project_create_post);
router.get("/project/:id", projectController.project_detail);
router.get("/project/:id/delete", projectController.project_delete_get);
router.post("/project/:id/delete", projectController.project_delete_post);
router.get("/project/:id/update", projectController.project_update_get);
router.post("/project/:id/update", projectController.project_update_post);

router.get("/technologies", technologyController.technology_list);
router.get("/technology/create", technologyController.technology_create_get);
router.post("/technology/create", technologyController.technology_create_post);
router.get("/technology/:id", technologyController.technology_detail);
router.get(
  "/technology/:id/delete",
  technologyController.technology_delete_get
);
router.post(
  "/technology/:id/delete",
  technologyController.technology_delete_post
);
router.get(
  "/technology/:id/update",
  technologyController.technology_update_get
);
router.post(
  "/technology/:id/update",
  technologyController.technology_update_post
);

module.exports = router;
