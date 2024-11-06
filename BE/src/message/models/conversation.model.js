import { model, models, Schema } from "mongoose";

const conversationSchema = new Schema({
	members: {
		type: Array,
		required: true,
	},
});

const Conversation = models.Conversation || model("Conversation", conversationSchema);
export default Conversation;
