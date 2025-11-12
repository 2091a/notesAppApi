import mongoose, { Schema } from "mongoose";

const userNote = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    noteTitle:{
        type: String,
        required: [true,"note is required"],
        unique: [true,"note title should be unique"],
     
    },
    noteDiscription:{
        type: String,
        
    }


},{timestamps:true})

userNote.index({ noteTitle: "text", noteDiscription: "text" });

export const Note = mongoose.model("Note",userNote)