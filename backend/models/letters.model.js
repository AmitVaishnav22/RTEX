import mongoose,{Schema} from "mongoose";

const LetterSchema = new Schema({
    userId: String,
    title: String,
    content: String,
  },{timestamps:true});

const Letter = mongoose.model("Letter", LetterSchema);

export default Letter;