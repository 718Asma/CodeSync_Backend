# User Profile API Documentation

## Introduction

This documentation outlines the API endpoints for managing user profiles, including retrieving profile information, updating details, uploading profile and cover images, and managing friends.

## API Endpoints

### 1\. Get User Profile

-   **GET /profile/:userId**

    -   Retrieves the profile information of the user with the specified ID.
    -   _Parameters_: `userId` (User ID)
    -   _Response_: User object containing profile details.
    -   _Example_:

        `{     "status": "success",     "data": {         "_id": "609f58608d079e17781ec6c2",         "fullName": "John Doe",         "email": "john@example.com",         "profileImage": "path/to/profile/image.jpg",         "coverImage": "path/to/cover/image.jpg",         "bio": "Lorem ipsum dolor sit amet...",         "friends": [...]         ...     } }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 2\. Update Profile Details

-   **POST /update-profile-details**

    -   Updates the profile details of the authenticated user.
    -   _Request Body_: JSON object with updated profile details (fullName, bio, occupation, gender, dateOfBirth, address, email).
    -   _Response_: Updated user object.
    -   _Example_:

        `{     "message": "Profile updated successfully",     "user": {         "_id": "609f58608d079e17781ec6c2",         "fullName": "John Doe",         "bio": "Updated bio...",         ...     } }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 3\. Upload Profile Image

-   **POST /upload-profile-image**

    -   Uploads a profile image for the authenticated user.
    -   _Request Body_: Form-data with profile image file.
    -   _Response_: Success message with the file path.
    -   _Example_:

        `{     "message": "Profile image uploaded successfully",     "filePath": "path/to/profile/image.jpg" }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 4\. Upload Cover Image

-   **POST /upload-cover-image**

    -   Uploads a cover image for the authenticated user.
    -   _Request Body_: Form-data with cover image file.
    -   _Response_: Success message with the file path.
    -   _Example_:

        `{     "message": "Cover image uploaded successfully",     "filePath": "path/to/cover/image.jpg" }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 5\. Add Friend

-   **POST /add-friend/:userId**

    -   Adds a user with the specified ID as a friend of the authenticated user.
    -   _Parameters_: `userId` (Friend's User ID)
    -   _Response_: Updated user object with the added friend.
    -   _Example_:

        `{     "status": "success",     "data": {         "_id": "609f58608d079e17781ec6c2",         "fullName": "John Doe",         ...         "friends": ["609f58608d079e17781ec6c3", "609f58608d079e17781ec6c4", ...]     } }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 6\. Remove Friend

-   **POST /remove-friend/:userId**

    -   Removes a user with the specified ID from the list of friends of the authenticated user.
    -   _Parameters_: `userId` (Friend's User ID)
    -   _Response_: Updated user object after removing the friend.
    -   _Example_:

        `{     "status": "success",     "data": {         "_id": "609f58608d079e17781ec6c2",         "fullName": "John Doe",         ...         "friends": ["609f58608d079e17781ec6c4", ...]     } }`

    -   _Errors_: 400 Bad Request, 404 Not Found, 500 Internal Server Error

### 7\. Search Users

-   **GET /search-users?name=query**

    -   Searches for users based on the specified name string.
    -   _Parameters_: `query` (Search query)
    -   _Response_: Array of user objects ( ids, fullNames and profilePictures ) matching the search query.
    -   _Example_:

        `{     "status": "success",     "data": [         {             "_id": "609f58608d079e17781ec6c3",             "fullName": "Jane Doe",             ...         },         {             "_id": "609f58608d079e17781ec6c4",             "fullName": "Alice Smith",             ...         },         ...     ] }`

    -   _Errors_: 400 Bad Request ( Query required ), 500 Internal Server Error

## Authentication

All endpoints require authentication using a valid JWT token. Ensure you include the token in the request headers as `Authorization: Bearer <token>`.

## Error Handling

The API follows standard HTTP status codes for error responses. Detailed error messages are provided in the JSON response body.

## Versioning

The current version of the API is v1. Future updates may introduce new endpoints or modifications.

## Conclusion

We hope this documentation helps you effectively use the User Profile API in your application. If you have any questions or need further assistance, please feel free to reach out to our backend team.

**Note**: This documentation assumes familiarity with RESTful API concepts and usage of HTTP methods for interacting with resources.
