const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const passport = require('passport');
const FriendRequest = require('../models/friendRequest');

// Send a Friend Request
exports.send_request_post = [
  passport.authenticate('jwt', { session: false }),
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }

    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId,
    });

    await newRequest.save();
    res.status(201).json({ message: 'Friend request sent successfully' });
  }),
];

// Accept a Friend Request
exports.accept_request_post = [
  passport.authenticate('jwt', { session: false }),
  param('requestId').notEmpty().withMessage('Request ID is required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.requestId;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can't accept this request" });
    }

    request.status = 'accepted';
    await request.save();

    res.status(200).json({ message: 'Friend request accepted' });
  }),
];

// Reject a Friend Request
exports.reject_request_post = [
  passport.authenticate('jwt', { session: false }),
  param('requestId').notEmpty().withMessage('Request ID is required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.requestId;
    const userId = req.user._id;

    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can't reject this request" });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Friend request rejected' });
  }),
];

// Get All Pending Friend Requests
exports.get_all_requests_get = [
  passport.authenticate('jwt', { session: false }),
  param('userId').notEmpty().withMessage('User ID is required'),
  asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const requests = await FriendRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender');

    res.status(200).json(requests);
  }),
];

// Delete a Friend Request
exports.delete_request_delete = [
  passport.authenticate('jwt', { session: false }),
  param('requestId').notEmpty().withMessage('Request ID is required'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.requestId;

    const request = await FriendRequest.findOneAndDelete({
      _id: requestId,
    });

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    res.status(200).json({ message: 'Friend request deleted successfully' });
  }),
];

// Delete all Friend Requests for the logged-in user
exports.delete_all_requests_delete = [
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await FriendRequest.deleteMany({ receiver: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No friend requests found to delete' });
    }

    res.status(200).json({ message: 'All friend requests deleted successfully' });
  }),
];
