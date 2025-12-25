import mongoose,{Schema} from "mongoose";

const LetterSchema = new Schema({
    userId: String,
    title: String,
    content: String,
    publicId: {
      type: String,
      default: null,
      unique: true,
    },
    isPublic: { type: Boolean, default: false },
    passcode: String,
    impressions: { type: Number, default: 0 },
    lastVisited: { type: Date },
    authorName: String,
    authorPhoto: String,
    authorEmail: String
  },{timestamps:true});

const Letter = mongoose.model("Letter", LetterSchema);

export default Letter;