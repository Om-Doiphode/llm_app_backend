import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    user: String,
    title: String,
    messages: [
        {
            role: String,
            message: String,
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ✅ Export correctly
const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
