import 'dotenv/config';  
import express from 'express';
import mongoose from 'mongoose';
import Chat from './models/ChatSchema.js';  
import cors from 'cors';
import authRoutes from './routes/auth.js';
import User from './models/User.js';

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
app.use(cors());
// app.use(cors({
//     origin: "https://hawkeye-gpt.netlify.app", // Allow your Netlify frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true
// }));

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>console.log("DB connected"))
.catch((err)=>console.log(err));

// Define a route
app.get('/', (req, res) => {
    res.send('Welcome to the Express.js Tutorial');
});

app.use('/api/auth', authRoutes);

app.post('/chats', async (req,res)=>{
    try{

        const {userId} = req.body;

        let query={};

        if(userId)
        {
            if(!mongoose.Types.ObjectId.isValid(userId))
            {
                return res.status(400).json({error:"Invalid User ID format"});
            }
            query.user = userId;
        }
        const chats = await Chat.find(query).populate("user","username");
        res.status(200).json(chats);
    }
    catch(err){
        res.status(500).json({error: `Failed to fetch chats: ${err.message}`});
    }
})

app.post('/addChats', async (req, res)=>{
    try{
        const {user, title, messages} = req.body;

        if(!mongoose.Types.ObjectId.isValid(user)){
            return res.status(400).json({error: "User ID is not valid"});
        }

        const existingUser = await User.findById(user);
        if(!existingUser)
        {
            return res.status(404).json({error: "User not found"});
        }
        const newChat = new Chat({
            user,
            title,
            messages
        });

        // console.log("New Chat:", newChat);
    
        await newChat.save();
        res.status(201).json({message: "Chat added successfully"});
    }
    catch(err){
        res.status(500).json({error: `Failed to add chat: ${err.message}`});
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

