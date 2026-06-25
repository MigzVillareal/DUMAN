import express from "express"
import * as groupController from "../controllers/Group.controller.js";

const router = express.Router();

// Group Crud
router.get("/groups", groupController.createGroup);
router.get("/groups", groupController.getAllGroups);
router.get("/groups", groupController.getGroupById);    
router.get("/groups", groupController.updateGroup);
router.get("/groups", groupController.deleteGroup);

// Member Management
router.get("/groups", groupController.addMember);
router.get("/groups", groupController.getAllMembers);
router.get("/groups", groupController.removeMember);

// Group Related Data Operations
router.get("/groups", groupController.getGroupMeetings);
router.get("/groups", groupController.getGroupNotifications);

export default router;