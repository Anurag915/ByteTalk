import express from "express";
import axios from "axios";
import { protectRoute } from "../middleware/clerk.js";

const router = express.Router();

router.get("/queue", protectRoute, async (req, res) => {
  try {
    // Connect to the RabbitMQ Management API
    const auth = Buffer.from("guest:guest").toString("base64");
    
    // In Docker, the RabbitMQ host is 'rabbitmq' based on docker-compose service name.
    const rabbitMqUrl = process.env.RABBITMQ_MANAGEMENT_URL || "http://rabbitmq:15672";
    
    // We want the 'chat_messages' queue in the default virtual host '%2F' (which is '/')
    const response = await axios.get(`${rabbitMqUrl}/api/queues/%2F/chat_messages`, {
      headers: {
        Authorization: `Basic ${auth}`
      }
    });

    const queueData = response.data;
    
    res.json({
      success: true,
      stats: {
        messages: queueData.messages || 0,
        messages_ready: queueData.messages_ready || 0,
        messages_unacknowledged: queueData.messages_unacknowledged || 0,
        message_rates: queueData.messages_details?.rate || 0,
        consumers: queueData.consumers || 0,
        state: queueData.state || "unknown"
      }
    });

  } catch (error) {
    console.error("Error fetching RabbitMQ queue stats:", error.message);
    res.status(500).json({ success: false, message: "Could not fetch queue status. Ensure RabbitMQ is running." });
  }
});

export default router;
