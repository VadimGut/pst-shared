import { db } from "../utils/db";
import helpers from "../utils/helpers";
import { PsGamePrice } from "../types";
import * as moment from "moment";
import * as _ from "lodash";

module.exports = class PsGamePriceModel {
  tableName = "ps_game_prices";

  async savePrices(data: PsGamePrice): Promise<any | false> {
    this.validatePrices(data);

    const lastPrice = await db(this.tableName)
      .where("ps_game_id", data.ps_game_id)
      .where("end_at", ">", helpers.getNowDate()) //??
      .orderBy("updated_at", "desc")
      .first();

    // If this discount does not exist create it
    if (!lastPrice) {
      return this.insert(data);
    }

    const basePriceEven = lastPrice.base_price === data.base_price;
    const discountedPriceEven =
      lastPrice.discounted_price === data.discounted_price;
    const discountedPercentEven =
      lastPrice.discounted_percent === data.discounted_percent;
    const discountedPricePsPlusEven =
      lastPrice.discounted_price_ps_plus == data.discounted_price_ps_plus;
    const discountedPercentPsPlusEven =
      lastPrice.discounted_percent_ps_plus == data.discounted_percent_ps_plus;
    const endAtEven =
      moment(lastPrice.end_at).diff(moment(data.end_at), "days") === 0;

    // If it is not exactly like the one in DB, create new one
    if (
      !basePriceEven ||
      !discountedPriceEven ||
      !discountedPercentEven ||
      !discountedPricePsPlusEven ||
      !discountedPercentPsPlusEven ||
      !endAtEven
    ) {
      return this.insert(data);
    }

    console.log(
      `## Price is the same, skipping. gameId: ${data.ps_game_id} lastPriceId: ${lastPrice.id}`
    );
    return false;
  }

  insert(data: PsGamePrice) {
    return db(this.tableName).insert({
      ...data,
      created_at: helpers.getNowDate(),
      updated_at: helpers.getNowDate(),
      created_by_id: 1,
      updated_by_id: 1,
    });
  }

  updatePrices(id: number, data: PsGamePrice): Promise<any> {
    return db(this.tableName).where("id", id).update(data);
  }

  private validatePrices(data: PsGamePrice) {
    if (_.isNil(data.base_price)) {
      throw new Error("Base price is required");
    }
  }
};
