import amqp from "amqplib";

let channel = null;
let connection = null;

export const connectQueue = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    connection = await amqp.connect(rabbitMqUrl);
    channel = await connection.createChannel();
    
    // Assert the queues we will be using
    await channel.assertQueue("chat_messages", {
      durable: true, // Queue survives broker restarts
    });
    
    console.log("RabbitMQ connected and channel 'chat_messages' created successfully.");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ, retrying in 5 seconds...", error.message);
    // Retry connection after delay
    setTimeout(connectQueue, 5000);
  }
};

export const getChannel = () => channel;

export const publishMessage = async (queue, payload) => {
  if (!channel) {
    console.error("RabbitMQ channel not initialized. Cannot publish message.");
    return false;
  }
  
  try {
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true, // Message survives broker restarts
    });
    return true;
  } catch (error) {
    console.error("Error publishing message to RabbitMQ:", error);
    return false;
  }
};
