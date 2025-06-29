// lib/redis.ts
import Redis from "ioredis";

const redis = new Redis("redis://default:qtp3dkzcGFSMr9cMOLSSKKzrGviwq2XF@redis-15333.c55.eu-central-1-1.ec2.redns.redis-cloud.com:15333");
host: "redis-15333.c55.eu-central-1-1.ec2.redns.redis-cloud.com",
  port: 15333,
  username: "default", // falls nötig
  password: "qtp3dkzcGFSMr9cMOLSSKKzrGviwq2XF",
  tls: {}
redis.set("ping", "pong").then(() => {
  return redis.get("ping");
}).then(result => {
  console.log("redis://default:qtprdkzcGFSMr9cMOLSSKKzrGviwq2XF@redis-15333.c55.eu-central-1-1.ec2.redns.redis-cloud.com:15333", process.env.REDIS_URL);
  redis.disconnect();
}).catch(err => {
  console.error("❌ Fehler bei Redis-Verbindung:", err);
});