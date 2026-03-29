import dotenv from "dotenv";
import mqtt from "mqtt";

dotenv.config();

const mqttUrl = process.env.MQTT_URL || "mqtt://localhost:1883";
const classroomId = process.env.CLASSROOM_ID!;
const rfidUID = process.env.RFID_UID!;

if (!classroomId || !rfidUID) {
  throw new Error("CLASSROOM_ID or RFID_UID not set in .env");
}

const client = mqtt.connect(mqttUrl);

client.on("connect", () => {
  console.log("🧠 Connected to MQTT broker for simulation");

  const topic = `classroom/${classroomId}/rfid`;

  // Publish a fake RFID scan
  client.publish(topic, rfidUID, () => {
    console.log(`📶 Sent simulated scan: ${rfidUID} -> ${topic}`);
    client.end();
  });
});