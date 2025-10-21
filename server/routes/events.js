"use strict";

const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/events");
const auth = require("../middleware/auth");
const validateBody = require("../middleware/validateBody");
const validateObjectId = require("../middleware/validateObjectId");
const { createEventSchema } = require("../models/Event");

router.post(
  "/",
  auth.ensureAuth,
  validateBody(createEventSchema),
  eventsController.create
);

router.get("/", eventsController.getAll);

router.get("/:id", validateObjectId, eventsController.getOne);

router.delete(
  "/:id",
  auth.ensureAuth,
  validateObjectId,
  eventsController.deleteEvent
);

// Since we want to update the event so it best to use PATCH to improve UX by partial update
router.patch(
  "/:id",
  auth.ensureAuth,
  validateObjectId,
  eventsController.updateEvent
);

router.delete(
  "/deleteAllEvents/:groupId",
  auth.ensureAuth,
  eventsController.deleteAllEvents
);

module.exports = router;
