const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Inisialisasi client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Path file orders
const ordersFile = path.join(__dirname, "orders.json");

// Fungsi simpan order
function saveOrder(data) {
    let orders = [];
    if (fs.existsSync(ordersFile)) {
        orders = JSON.parse(fs.readFileSync(ordersFile));
    }
    orders.push(data);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Bot ready
client.on("ready", () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`);
});

// Event message
client.on("messageCreate", async (msg) => {
    if (!msg.content.startsWith("!order")) return;

    // Format: !order Nama | Joki | Harga | DurasiHari
    const args = msg.content.split("|").map(a => a.trim());

    if (args.length < 4) {
        return msg.reply("Format salah! Gunakan: !order Nama | Joki | Harga | DurasiHari");
    }

    const nama = args[0].replace("!order", "").trim();
    const joki = args[1];
    const harga = args[2];
    const durasi = Number(args[3]);

    if (isNaN(durasi)) {
        return msg.reply("Durasi harus berupa angka!");
    }

    // Hitung tanggal mulai dan selesai
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 1);

    const end = new Date(start);
    end.setDate(end.getDate() + (durasi - 1));

    const format = (d) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    // Simpan order
    saveOrder({
        nama,
        joki,
        harga,
        durasi,
        mulai: format(start),
        selesai: format(end),
        status: "Proses"
    });

    // Buat embed
    const embed = new EmbedBuilder()
        .setColor("#ffaa00")
        .setTitle("📌 Detail Order")
        .addFields(
            { name: "👤 Nama", value: nama, inline: true },
            { name: "🎮 Joki", value: joki, inline: true },
            { name: "💵 Harga", value: harga, inline: true },
            { name: "📆 Mulai", value: format(start), inline: true },
            { name: "⏳ Selesai", value: format(end), inline: true },
            { name: "📂 Status", value: "Proses", inline: true }
        )
        .setFooter({ text: "Order berhasil disimpan ✔" });

    msg.channel.send({ embeds: [embed] });
});

// Login bot menggunakan environment variable TOKEN
client.login(process.env.TOKEN);