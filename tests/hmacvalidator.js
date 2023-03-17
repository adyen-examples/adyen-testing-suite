// WIP - Ported from typescript: https://github.com/Adyen/adyen-node-api-library/blob/develop/src/utils/hmacValidator.ts
const crypto = require("crypto");

class HmacValidator {
  static HMAC_SHA256_ALGORITHM = "sha256";
  static DATA_SEPARATOR = ":";

  static calculateHmac(data, key) {
    const dataString =
      typeof data !== "string" ? HmacValidator.getDataToSign(data) : data;
    const rawKey = Buffer.from(key, "hex");
    return crypto
      .createHmac(HmacValidator.HMAC_SHA256_ALGORITHM, rawKey)
      .update(dataString, "utf8")
      .digest("base64");
  }

  static validateHMAC(notificationRequestItem, key) {
    if (notificationRequestItem.additionalData?.hmacSignature) {
      const expectedSign = HmacValidator.calculateHmac(
        notificationRequestItem,
        key
      );
      const merchantSign = notificationRequestItem.additionalData?.hmacSignature;
      if (merchantSign?.length === expectedSign.length) {
        return crypto.timingSafeEqual(
          Buffer.from(expectedSign, "base64"),
          Buffer.from(merchantSign, "base64")
        );
      }
      return false;
    }
    throw Error(`Missing hmacSignature`);
  }

  static isNotificationRequestItem(item) {
    return !Object.values(item).every((value) => typeof value === "string");
  }

  static getDataToSign(notificationRequestItem) {
    if (HmacValidator.isNotificationRequestItem(notificationRequestItem)) {
      const signedDataList = [];
      signedDataList.push(notificationRequestItem.pspReference);
      signedDataList.push(notificationRequestItem.originalReference);
      signedDataList.push(notificationRequestItem.merchantAccountCode);
      signedDataList.push(notificationRequestItem.merchantReference);
      signedDataList.push(notificationRequestItem.amount.value);
      signedDataList.push(notificationRequestItem.amount.currency);
      signedDataList.push(notificationRequestItem.eventCode);
      signedDataList.push(notificationRequestItem.success);
      return signedDataList.join(HmacValidator.DATA_SEPARATOR);
    } else {
      const keys = [];
      const values = [];
      const replacer = (str) =>
        str.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
      Object.entries(notificationRequestItem)
        .sort()
        .forEach(([key, value]) => {
          keys.push(replacer(key));
          values.push(replacer(value));
        });

      return [...keys, ...values].join(HmacValidator.DATA_SEPARATOR);
    }
  }
}