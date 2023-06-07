var axios = require("axios");
var sun = require('sun-time')


const ENV = { BotToken: "5369122007:AAH91_qlxfsK8Kshc1ihP3Op9Nn_ThMY1bQ" };

const Chats = [
    {
        chatId: "-1001869916477",
        city: "Raanana"
    },
    // {
    //     chatId: "",
    //     city: "Jerusalem"
    // }
]

class Zmanim {

    constructor() {
        this.sunriseD = null;
        this.sunsetD = null;
        this.zmanit = null;
    }

    job() { // 5 am
        console.log('running task');
        // calc today's sunrise and sunset:
        Chats.forEach(chat => {
            const sunrise = sun.rise(chat.city),
                sunset = sun.set(chat.city);
            console.log('sunrise: ', sunrise);
            console.log('sunset: ', sunset);

            this.sunriseD = this.timeToDate(sunrise);
            this.sunsetD = this.timeToDate(sunset);
            this.zmanit = (this.sunsetD.getTime() - this.sunriseD.getTime()) / 12;
            console.log('zmanit ms: ', this.zmanit);
            const hazot = this.getZmanitTime(6)
            const endOfFourth = this.getZmanitTime(4)
            const sixAndAHalf = this.getZmanitTime(6.5);
            const twelve = this.getZmanitTime(12);
            sendToChatId({ chatId: chat.chatId, endOfFourth, hazot, sixAndAHalf, twelve })
        })
    }

    timeToDate(time) {
        const d = new Date();
        const timeSplit = time.split(":");
        const hrs = timeSplit[0], mins = timeSplit[1];
        d.setHours(hrs); d.setMinutes(mins);
        return d;
    }

    getZmanitTime(zmanitHr) {
        return new Date(this.sunriseD.getTime() + (this.zmanit * zmanitHr)).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
    }

}

/**
 * 
 * @param {{ chatId:string; endOfFourth:string; hazot:string; sixAndAHalf:string; twelve:string; }} param0 
 */
async function sendToChatId({ chatId, endOfFourth, hazot, sixAndAHalf, twelve }) {
    const endOfFourthFormatted = formatForMessage(endOfFourth);
    const hazotFormatted = formatForMessage(hazot);
    const sixAndAHalfFormatted = formatForMessage(sixAndAHalf);
    const sunsetFormatted = formatForMessage(twelve);
    console.log('endOfFourthFormatted: ', endOfFourthFormatted);
    console.log('sixAndAHalfFormatted: ', sixAndAHalfFormatted);
    console.log('hazotFormatted: ', hazotFormatted);
    console.log('sunsetFormatted: ', sunsetFormatted);
    const message = [
        `**⌛ סוף זמן תפילה לגר"א** (=סוף שעה רביעית): ${endOfFourthFormatted}`,
        "",
        `**☀️ חצות - סוף זמן  תפילה בדיעבד** (=שעה שישית): ${hazotFormatted}`,
        "",
        `**⌚ אפשר להתחיל מנחה (גדולה)** (=שעה שישית וחצי): ${sixAndAHalfFormatted}`,
        "",
        `**🌇 שקיעה - סוף זמן מנחה (=סוף שעה 12): ${sunsetFormatted}`
    ];
    try {
        const { data } = await axios.post(`https://api.telegram.org/bot${ENV.BotToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message.join("\n"),
                parse_mode: "markdown"
            }
        )
        console.log('telegram sendMessage: ', data);
    } catch (e) {
        console.log("ERROR: ", e?.response?.data);
    }
}

function formatForMessage(localeString) {
    const split = localeString.split(", ")[1].split(":");
    return `${split[0]}:${split[1]}`
}

const zman = new Zmanim();
// cron.schedule('0 10 * * *', zman.job);
zman.job();