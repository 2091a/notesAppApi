import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { verifyOtp } from "../utils/otpService.js";
import { Note } from "../models/note.model.js";



const genrateAccessAndRefereshTokens = async(userId)=>{
    try {
       
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Somting went wrong while generating referesh and access token")
    }
}



const registerUser = asyncHandler(async(req,res)=>{
    //get user details from frontend
   //validation - not empty
   //check if user already exists: username, email 
   // verify OTP
   //create user object - creat entry in db 
   //remove password and refresh token filed from response 
   //check for user creation 
   // return response


   const {email,userName,fullName,password,phoneNo,otp} = req.body

   // to check multiple filed for same condection in a single if condection 
   if([email,userName,fullName,password].some((filed)=>filed?.trim() ==="")){
    throw new ApiError(400,"All fileds are required")
   }
   if(!phoneNo){
    throw new ApiError(400,"Phone Number is required");
   }
   if(!otp){
    throw new ApiError(400,"OTP is required");
   }

   

// Verify OTP properly
const otpResult = await verifyOtp(email, otp);

if (otpResult !== true ) {
  throw new ApiError(400, otpResult);
}

   const existedUser = await User.findOne({
    $or:[{email,userName,phoneNo}]
   })

   if(existedUser){
    throw new ApiError(409,"User with email or username alredy exists")
   }


  const user = await User.create({
    userName:userName.toLowerCase(),
    email,
    fullName,
    password,
    phoneNo
  })
  console.log(user)

  const createUser = await User.findById(user._id).select("-password ")
  console.log(createUser)

  if(!createUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200,createUser,"User registered Successfully ")
  )
})

const loginUser = asyncHandler(async(req,res)=>{
   // req body -> data
  // username or email
  //find the user
  // check password 
  //verify otp
  //acces and refresh token genrate 
  //send cookie
  const {email, userName, password,otp} = req.body
 

  if(!(email||userName)){
    throw new ApiError(400,"User name or email is required ")
  }
  if(!password){
    throw new ApiError(400,"password is required");
  }
  if(!otp){
    throw new ApiError(400,"otp is required")
  }

  const user = await User.findOne({
    $or:[{userName},{email}]
  }
  )

  if(!user){
    throw new ApiError(404,"user does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
  }

  // otp verification 
  const otpResult = await verifyOtp(email, otp);
  if (otpResult !== true ) {
  throw new ApiError(400, otpResult);}


  const {accessToken,refreshToken}= await genrateAccessAndRefereshTokens(user._id)

  const loggdInUser = await User.findById(user._id).select("-password -refreshToken")

  const options={
    httpOnly: true,
    secure: true
  }
  const nowUTC = new Date(); 

  const lastLogin = await User.findByIdAndUpdate(
    user._id,
    {
      $push: {
        lastLogin: {
          loginAt: new Date(nowUTC.getTime() + (5.5 * 60 * 60 * 1000)),
        },
      },
    },
    { new: true }
  ).select("lastLogin");

  if(!lastLogin){
    throw new ApiError(400,"Faild to update login history")
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(
      200,
      {
        user:loggdInUser,accessToken,
        refreshToken,
        lastLogin
      },
      "User logged in Successfully"
    )
  )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
  console.log(req.user);
  return res.status(200)
  .json(new ApiResponse(
    200,
    await req.user,
    "current user fetched successfully"
  ))
})

const logOutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken: 1 // this remove the file from document
      }
    },
    {
      new: true
    }
  )
  const options={
    httpOnly: true,
    secure: true
  }
  return res.status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User Logged Out")
  )
})

const createNote = asyncHandler(async(req,res)=>{
  // req body
  //validation - not empty
  //check userId exist
  //create note object - creat entry in db 
   //check for note creation 
   // return response
  const {noteTitle,noteDiscription} = req.body
  const curentUserId = req.user._id;
  if(!(curentUserId||noteTitle)){
    throw new ApiError(400,"userId and Note Title is required ")
  }

  const user = await User.findById(curentUserId).select("-password -refreshToken")

  if(!user){
    throw new ApiError(404,"userId does not exist")
  }

  const note = await Note.create({
    userId:user._id,
    noteTitle:noteTitle,
    noteDiscription:noteDiscription
  })

  const noteCreated = await Note.findById(note._id)

  if(!noteCreated){
    throw new ApiError(500,"somting went wrong while creating Note")
  }

  return res.status(200)
  .json(new ApiResponse(200,noteCreated,"Note created Successfully"))
})

const updateNoteDiscription = asyncHandler(async(req,res)=>{
const {noteTitle,noteDiscription} = req.body

if(!noteTitle){
  throw new ApiError (400,"noteTitle is required")
}

const note = await Note.findOneAndUpdate({noteTitle:noteTitle},{
  $set:{
    noteTitle:noteTitle,
    noteDiscription:noteDiscription
  }
},{new:true})

if(!note){
  throw new ApiError(500,"someting went wrong while updating Note Discription")
}

return res.status(200)
.json(new ApiResponse(200,note,`${note.noteTitle} Discription updated successfully`))

})

const updateNoteTitle = asyncHandler(async(req,res)=>{
  const {oldNoteTitle,newNoteTitle} = req.body

if(!(oldNoteTitle || newNoteTitle)){
  throw new ApiError (400,"oldNoteTitle and newNoteTitle is required")
}

const note = await Note.findOneAndUpdate({noteTitle:oldNoteTitle},{
  $set:{
    noteTitle:newNoteTitle,
  }
},{new:true})

if(!note){
  throw new ApiError(500,"someting went wrong while updating Note Title")
}

return res.status(200)
.json(new ApiResponse(200,note,`${note.noteTitle} Title updated successfully`))
})

const deleteNote = asyncHandler(async(req,res)=>{
  const {noteTitle,noteId} = req.body
  const deleteResult = await Note.findOneAndDelete({
    $or:[{noteId},{noteTitle}]
  }) 

  if(!deleteResult){
    throw new ApiError(400,"somting whent woring Pless check your noteId or noteTitle ")
  }

  return res.status(200).json(new ApiResponse(200,`${noteTitle || noteId} delted successfully`))
})

const getNote = asyncHandler(async(req,res)=>{
  const {noteTitle,noteId} = req.body
  if(!(noteTitle || noteId)){
    throw new ApiError(400,"Please provide notesTitle or noteId")
  }

  const note = await Note.findOne({
    $or:[{noteId},{noteTitle}]
  })

  if(!note){
    throw new ApiError(500,"Note no found with this noteId or noteTitle ")
  }

  return res.status(200).json(new ApiResponse(200,note,"Note fetched successfully"));

})




export {genrateAccessAndRefereshTokens,
  registerUser,
  loginUser,
  getCurrentUser,
  logOutUser,
  createNote,
  updateNoteDiscription,
  updateNoteTitle,
  deleteNote,
  getNote
}