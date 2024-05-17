const request = require("supertest");
const app = require("../app"); // Assuming your Express app is exported from app.js
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

jest.mock("bcryptjs");
jest.mock("express-validator");

describe("POST /auth/signup", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 if validation fails", async () => {
        // Mocking validation errors
        validationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: "Validation error" }],
        });

        const response = await request(app).post("/auth/signup").send({}); // Sending empty body to trigger validation error

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            errors: [{ msg: "Validation error" }],
        });
    });

    it("should return 400 if bcrypt.hash encounters an error", async () => {
        // Mock body function and its chaining methods
    body.mockReturnValueOnce((field, message) => ({
        trim: jest.fn().mockReturnValue itself, // Allow chaining
        isLength: jest.fn(),
        escape: jest.fn(),
      }));
  
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Validation error" }],
      });

        bcrypt.hash.mockImplementation((password, salt, callback) => {
            callback(new Error("Hashing error"));
        });

        const response = await request(app).post("/auth/signup").send({
            fullName: "John Doe",
            username: "johndoe",
            password: "password",
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal Server Error" });
    });

    it("should create a new user and return tokens if validation passes and hashing is successful", async () => {
        validationResult.mockReturnValue({ isEmpty: () => true });

        // Mocking hashed password
        const hashedPassword = "$2b$10$1234567890abcdefghij";
        bcrypt.hash.mockImplementation((password, salt, callback) => {
            callback(null, hashedPassword);
        });

        // Mocking JWT sign method
        jest.mock("jsonwebtoken", () => ({
            sign: jest
                .fn()
                .mockReturnValueOnce("access_token")
                .mockReturnValueOnce("refresh_token"),
        }));

        const response = await request(app).post("/auth/signup").send({
            fullName: "John Doe",
            username: "johndoe",
            password: "password",
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            access_token: "access_token",
            refresh_token: "refresh_token",
            user_id: expect.any(String), // Assuming user._id is returned in the response
        });
    });
});
