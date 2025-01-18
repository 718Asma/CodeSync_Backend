const asyncHandler = require('express-async-handler');
const { body, param, validationResult } = require('express-validator');
const passport = require('passport');

const FriendRequest = require('../models/friendRequest');
const User = require("../models/user");

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
      status: 'pending'
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

    // Add both the receiver and sender as friends
    const user = await User.findById(userId);
    const friend = await User.findById(request.sender);

    if (!user || !friend) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already friends
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add to friends
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    await Promise.all([user.save(), friend.save()]);

    res.status(200).json({ message: 'Friend request accepted and friends added!' });
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

    try {
      // Fetch friend requests where the user is either the sender or the receiver
      const requests = await FriendRequest.find({
        $or: [
          { sender: userId },
          { receiver: userId }
        ],
        status: 'pending'
      })
        .populate('sender');

      if (requests.length === 0) {
        return res.status(404).json({ message: 'No pending friend requests found.' });
      }

      res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ message: 'An error occurred while fetching friend requests. Please try again later.' });
    }
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
