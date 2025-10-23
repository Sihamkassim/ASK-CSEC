
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  text: {
     type: String,
     required: true 
    },
  embedding: 
  { type:
     [Number], 
     required: true 
    },
});

export default mongoose.model("Document", documentSchema);
