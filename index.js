var cron = require('node-cron');
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


module.exports = () => {

    cron.schedule('0 5 * * *', job);
    function job() { // 5 am
        console.log('running task');
        // calc today's sunrise and sunset:
        console.log('Chats: ', Chats);
        Chats.forEach(chat => {
            const sunrise = sun.rise(chat.city),
                sunset = sun.set(chat.city);
            let hazot, endOfFourth;
            console.log('sunrise: ', sunrise);
            console.log('sunset: ', sunset);

            const sunriseD = timeToDate(sunrise);
            const sunsetD = timeToDate(sunset);
            const zmanit = (sunsetD.getTime() - sunriseD.getTime()) / 12;
            console.log('zmanit: ', zmanit);
            hazot = getZmanitTime(6, sunriseD, zmanit)
            endOfFourth = getZmanitTime(4, sunriseD, zmanit)
            sendToChatId(chat.chatId, endOfFourth, hazot)
        })
    }

    function timeToDate(time) {
        const d = new Date();
        const timeSplit = time.split(":");
        const hrs = timeSplit[0], mins = timeSplit[1];
        d.setHours(hrs); d.setMinutes(mins);
        return d;
    }

    function getZmanitTime(zmanitHr, sunriseD, zmanit) {
        return new Date(sunriseD.getTime() + (zmanit * zmanitHr)).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
    }

    async function sendToChatId(chatId, endOfFourth, hazot) {
        const endOfFourthFormatted = formatForMessage(endOfFourth);
        const hazotFormatted = formatForMessage(hazot);
        const message = `סוף שעה רביעית: ${endOfFourthFormatted}\nחצות: ${hazotFormatted}`;
        try {
            const res = await axios.post(`https://api.telegram.org/bot${ENV.BotToken}/sendMessage`, { chat_id: chatId, text: message })
        } catch (e) {
            console.log("e?.response?.data: ", e?.response?.data);
        }
    }

    function formatForMessage(localeString) {
        console.log('localeString: ', localeString);
        const split = localeString.split(", ")[1].split(":");
        console.log('split: ', split);
        return `${split[0]}:${split[1]}`
    }

}