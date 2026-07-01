import express from "express"
import * as groupController from "../controllers/Group.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Group CRUD
router.post("/", authenticateToken, groupController.createGroup);
router.get("/", authenticateToken, groupController.getAllGroups);
router.get("/:groupId", authenticateToken, groupController.getGroupById);    
router.patch("/:groupId", authenticateToken, groupController.updateGroup);
router.delete("/:groupId", authenticateToken, groupController.deleteGroup);

// Member Management
router.get("/:groupId/members", authenticateToken, groupController.getAllMembers);
router.delete("/:groupId/members/:memberId", authenticateToken, groupController.removeMember);

// Invite System
router.post("/:groupId/invite", authenticateToken, groupController.sendInvite);
router.get("/:groupId/invites", authenticateToken, groupController.getGroupInvites)
router.patch("/:groupId/invites/accept", authenticateToken, groupController.acceptInvite);
router.patch("/:groupId/invites/decline", authenticateToken, groupController.declineInvite);

// Related Data Operations
router.get("/:groupId/meetings", authenticateToken, groupController.getGroupMeetings);
router.get("/:groupId/notifications", authenticateToken, groupController.getGroupNotifications);

export default router;