import express from "express"
import * as groupController from "../controllers/Group.controller.js";

const router = express.Router();

// Group CRUD
router.post("/", groupController.createGroup);
router.get("/", groupController.getAllGroups);
router.get("/:groupId", groupController.getGroupById);    
router.patch("/:groupId", groupController.updateGroup);
router.delete("/:groupId", groupController.deleteGroup);

// Member Management
router.get("/:groupId/members", groupController.getAllMembers);
router.delete("/:groupId/members/:memberId", groupController.removeMember);

// Invite System
router.post("/:groupId/invite", groupController.sendInvite);
router.get("/:groupId/invites", groupController.getGroupInvites)
router.patch(";/:groupId/invites/accept", groupController.acceptInvite);
router.patch("/:groupId/invites/decline", groupController.declineInvite);

// Related Data Operations
router.get("/:groupId/meetings", groupController.getGroupMeetings);
router.get("/:groupId/notifications", groupController.getGroupNotifications);

export default router;