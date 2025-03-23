import 'dotenv/config';  
import express from 'express';
import mongoose from 'mongoose';
import Chat from './models/ChatSchema.js';  
import cors from 'cors';

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cors({
    origin: ["https://hawkeye-gpt.netlify.app/"],  // Add Netlify domain
    methods: ["GET", "POST", "DELETE", "OPTIONS"],   // Allow necessary methods
    allowedHeaders: ["Content-Type", "Authorization"]
}));


mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>console.log("DB connected"))
.catch((err)=>console.log(err));

// Define a route
app.get('/', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.get('/chats', async (req,res)=>{
    try{
        const chats = await Chat.find();
        res.status(200).json(chats);
    }
    catch(err){
        res.status(500).json({error: `Failed to fetch chats: ${err}`});
    }
})

app.post('/addChats', async (req, res)=>{
    try{
        const {user, title, messages} = req.body;
        console.log("INSIDE")
        console.log("Chat model:", Chat);
    
        const newChat = new Chat({
            user,
            title,
            messages
        });

        console.log("New Chat:", newChat);
    
        await newChat.save();
        res.status(201).json({message: "Chat added successfully"});
    }
    catch(err){
        res.status(500).json({error: `Failed to add chat: ${err}`});
    }
})

// Route to Get a Specific Chat by ID
app.get('/chats/:id', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch chat", details: error.message });
    }
});

app.delete('/chats/:id', async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.id);
        if (!deletedChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete chat", details: error.message });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

