require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  // Only your server
  if (message.guild?.id !== "1510009693622374483") return;

  // Only your AI channel
  if (message.channel.id !== "1512287195938160771") return;

  try {

    const response = await fetch(
      "https://api.x.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "grok-2-latest",
          messages: [
            {
              role: "user",
              content: message.content
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("GROK RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      return message.reply(
        `API Error: ${data.error?.message || "Unknown Error"}`
      );
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return message.reply("Grok returned no message.");
    }

    await message.reply(reply);

  } catch (error) {

    console.error(error);

    await message.reply(
      "Bot error. Check Railway logs."
    );

  }

});

client.login(process.env.DISCORD_TOKEN);
