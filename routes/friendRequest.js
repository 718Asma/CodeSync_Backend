let express = require('express');
let router = express.Router();
let friendRequestController = require('../controllers/friendRequestController');

// Route to send a friend request
router.post('/send', friendRequestController.send_request_post);

// Route to accept a friend request
router.post('/accept/:requestId', friendRequestController.accept_request_post);

// Route to reject a friend request
router.post('/reject/:requestId', friendRequestController.reject_request_post);

// Route to get all pending friend requests for a user
router.get('/requests/:userId', friendRequestController.get_all_requests_get);

// Route to delete a specific friend request
router.delete('/delete/:requestId', friendRequestController.delete_request_delete);

// Route to delete all friend requests for the logged-in user
router.delete('/delete-all', friendRequestController.delete_all_requests_delete);

module.exports = router;
