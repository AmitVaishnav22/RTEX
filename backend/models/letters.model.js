import mongoose,{Schema} from "mongoose";

const LetterSchema = new Schema({
    userId: String,
    title: String,
    content: String,
    publicId: {
      type: String,
      default: "",
      unique: true,
    },
    isPublic: { type: Boolean, default: true },
    passcode: String,
    impressions: { type: Number, default: 0 },
    lastVisited: { type: Date },
  },{timestamps:true});

const Letter = mongoose.model("Letter", LetterSchema);

export default Letter;