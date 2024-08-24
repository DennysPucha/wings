const QRCode = require('qrcode');


class Utils {

    static async generarQr(String){
        try {
            const qr = await QRCode.toDataURL(String);
            return qr;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
}

module.exports = Utils;
