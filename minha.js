var axios = require("axios");
var sun = require('sun-time')
require("dotenv").config()


const ENV = { BotToken: "5369122007:AAH91_qlxfsK8Kshc1ihP3Op9Nn_ThMY1bQ" };

const Chats = [
    {
        chatId: "-1001869916477",
        city: "Raanana",
        cityName: "רעננה",
    },
    {
        chatId: "-1001940113774",
        city: "Jerusalem",
        cityName: "ירושלים",
    }
]

function log(...params) {
    console.log("\n", new Date(), "LOG |", ...params, ";;;")
}
function error(...params) {
    console.error("\n", new Date(), "ERROR |", ...params, ";;;")
}

class Zmanim {

    constructor() {
        this.sunriseD = null;
        this.sunsetD = null;
        this.zmanit = null;
    }

    job() {
        log('running task');
        // calc today's sunrise and sunset:
        Chats.forEach(chat => {
            const sunrise = sun.rise(chat.city),
                sunset = sun.set(chat.city);
            log('sunrise: ', sunrise);
            log('sunset: ', sunset);

            this.sunriseD = this.timeToDate(sunrise);
            this.sunsetD = this.timeToDate(sunset);
            this.zmanit = (this.sunsetD.getTime() - this.sunriseD.getTime()) / 12;
            log('zmanit ms: ', this.zmanit);
            const sixAndAHalf = this.getZmanitTime(6.5);
            const twelve = this.getZmanitTime(12);
            sendToChatId({ chatId: chat.chatId, cityName: chat.cityName, hours: { sixAndAHalf, twelve } })
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
 * @typedef {{ sixAndAHalf:string; twelve:string; }} Hours
 * @param {{ chatId:string; cityName:string; hours: Hours }} param0 
 */
async function sendToChatId({ cityName, chatId, hours }) {
    const { sixAndAHalf, twelve } = hours;
    const sixAndAHalfFormatted = formatForMessage(sixAndAHalf);
    const sunsetFormatted = formatForMessage(twelve);
    log('sixAndAHalfFormatted: ', sixAndAHalfFormatted);
    log('sunsetFormatted: ', sunsetFormatted);
    const message = [
        `תפילת מנחה, ${cityName}:`,
        `**⌚ אפשר להתחיל מנחה (גדולה)** (=שעה שישית וחצי): ${sixAndAHalfFormatted}`,
        "",
        `**🌇 שקיעה - סוף זמן מנחה (=סוף שעה 12): ${sunsetFormatted}`
    ];
    console.log('message: ', message);
    try {
        if (process.env.NODE_ENV !== "prod") throw `process.env.NODE_ENV: ${process.env.NODE_ENV}`;
        const { data } = await axios.post(`https://api.telegram.org/bot${ENV.BotToken}/sendMessage`,
            {
                chat_id: chatId,
                text: message.join("\n"),
                parse_mode: "markdown"
            }
        )
        log('telegram sendMessage: ', data);
    } catch (e) {
        error(e || e.response || e.response.data);
    }
}

function formatForMessage(localeString) {
    const split = localeString.split(", ")[1].split(":");
    return `${split[0]}:${split[1]}`
}

const zman = new Zmanim();
zman.job();
