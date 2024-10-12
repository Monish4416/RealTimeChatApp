const express = require("express");
const registerUser = require("../controller/registerUser");
const checkEmail = require("../controller/checkEmail");
const checkPassword = require("../controller/checkPassword");
const userDetails = require("../controller/userDetails");
const logout = require("../controller/logout");
const updateUserDetails = require("../controller/updateUserDetails");
const searchUser = require("../controller/searchUser");

const router = express.Router()

//Create User API

router.post("/register",registerUser)

//Check User Email
router.post("/email",checkEmail)

//Check Password
router.post("/password",checkPassword)

//Login User Details
router.get("/user-details",userDetails)

//Logout User
router.get("/logout",logout)

//Update User Details
router.post("/update-user",updateUserDetails)

//Search user
router.post("/search-user",searchUser)

module.exports = router