const express = require("express");
const router = express.Router({ mergeParams: true });
const roomController = require("../room/room.controller");
const authenticate = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const upload = require("../../middlewares/upload.middleware");

// Nested Room Routes for Hostels
router.post(
  "/",
  authenticate,
  authorize("HOST", "ADMIN", "SUPER_ADMIN"),
  upload.array("images", 10),
  roomController.createRoom
);

router.get("/", roomController.getHostelRooms);

router.patch(
  "/:roomId",
  authenticate,
  authorize("HOST", "ADMIN", "SUPER_ADMIN"),
  upload.array("images", 10),
  roomController.updateRoom
);

router.delete(
  "/:roomId",
  authenticate,
  authorize("HOST", "ADMIN", "SUPER_ADMIN"),
  roomController.deleteRoom
);

router.patch(
  "/:roomId/availability",
  authenticate,
  authorize("HOST", "ADMIN", "SUPER_ADMIN"),
  roomController.updateRoomAvailability
);

module.exports = router;
