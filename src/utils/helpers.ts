import * as _ from "lodash";
import * as fs from "fs";
import moment = require("moment");
import { Moment } from "moment";

const helpers = {
  sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),

  toSnakeCase(obj: any) {

    return _.transform(obj, (acc: any, value: any, key: any, target: any) => {
      const camelKey = _.isArray(target) ? key : _.snakeCase(key);
      
      acc[camelKey] = _.isObject(value) ? this.toSnakeCase(value) : value;
    })
  },

  saveFile: (fileName: string, json: string) => {
    fs.writeFile(
      fileName,
      typeof json === "string" ? json : JSON.stringify(json),
      "utf8",
      function (err: any) {
        if (err) {
          console.log("An error occurred while writing JSON Object to File.");
          return console.log(err);
        }

        console.log(`------ Saved To: "${fileName}"`, new Date().toISOString());
      }
    );
  },

  getNowDate: () => {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  },

  getDateMinusOffset: (offset: number = 0) => {
    return moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
    // const date = new Date();
    // date.setDate(date.getDate() - offset);
    // return date.toISOString().slice(0, 19).replace("T", " ");
  },

  parseDate(str: string) {
    try {
      return str.slice(0, 19).replace("T", " ");
    } catch (e) {
      console.log("Error while parsing date:", str);
      return null;
    }
  },

  dateToMySqlFormat(date: Moment) {
    return date.format("YYYY-MM-DD HH:mm:ss");
  }
};

export default helpers;