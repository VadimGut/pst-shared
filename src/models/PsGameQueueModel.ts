import * as moment from "moment";
import { PsGameQueue, PsGameQueueStatus, PsGameQueueTopic } from "../types";
import { db } from "../utils/db";
import helpers from "../utils/helpers";

export default class PsGameQueueModel {
  tableName = "ps_game_queues";

  setTaskStatus(id: number, status: PsGameQueueStatus, message?: string) {
    const updateData = {
      status,
      updated_at: helpers.dateToMySqlFormat(moment()),
      message: message,
    };

    return db(this.tableName).where("id", id).update(updateData);
  }

  removeFromPsGameQueue(id: number) {
    return db(this.tableName).where("id", id).del();
  }

  getTaskByGuid(storeGuid: string, region: string, status?: PsGameQueueStatus) {
    let queue = db(this.tableName)
      .where("store_guid", storeGuid)
      .where("store_region", region);

    if (status) {
      queue.where("status", status);
    }

    return queue.first();
  }

  getTasks({
    limit = 10,
    topic,
    status = PsGameQueueStatus.PENDING,
    storeGuid,
    storeRegion,
  }: {
    limit?: number;
    topic?: PsGameQueueTopic;
    status?: PsGameQueueStatus;
    storeGuid?: string;
    storeRegion?: string;
  }) {
    let query = db(this.tableName).limit(limit);

    if (topic) {
      query.where("topic", topic);
    }
    if (status) {
      query.where("status", status);
    }
    if (storeGuid) {
      query.where("store_guid", storeGuid);
    }
    if (storeRegion) {
      query.where("store_region", storeRegion);
    }

    return query;
  }

  async getUnUpdatedGuids({
    storeGuids,
    storeRegion,
    offsetDays = 7,
  }: {
    storeGuids: string[];
    storeRegion: string;
    offsetDays?: number;
  }) {
    const gamesInQueue: PsGameQueue[] = await db(this.tableName)
      .select("store_guid")
      .whereIn("store_guid", storeGuids)
      .andWhere("store_region", storeRegion)
      .andWhere("topic", PsGameQueueTopic.PRICE_UPDATE)
      .andWhere("created_at", ">", helpers.getDateMinusOffset(offsetDays));

    const unUpdatedGuids = gamesInQueue.map((x) => x.store_guid);

    return storeGuids.filter(
      (storeGuid) => !unUpdatedGuids.includes(storeGuid)
    );
  }

  async getMissingGames(
    gameGuids: string[],
    storeRegion: string,
    status?: PsGameQueueStatus
  ) {
    const query = db(this.tableName)
      .select("store_guid")
      .whereIn("store_guid", gameGuids)
      .andWhere("store_region", storeRegion);

    if (status) {
      query.andWhere("status", status);
    }

    const existingGuids = await query.then((res: PsGameQueue[]) =>
      res.map(({ store_guid }) => store_guid)
    );

    return gameGuids.filter((gameGuid) => !existingGuids.includes(gameGuid));
  }

  async addToQueue({
    storeGuids,
    storeRegion,
    topic,
    message,
  }: {
    storeGuids: string[];
    storeRegion: string;
    topic: PsGameQueueTopic;
    message?: string;
  }) {
    const promises = storeGuids.map((storeGuid) => {
      return db(this.tableName)
        .insert({
          store_guid: storeGuid,
          store_region: storeRegion,
          status: PsGameQueueStatus.PENDING,
          message,
          created_at: helpers.dateToMySqlFormat(moment()),
          updated_at: helpers.dateToMySqlFormat(moment()),
          topic,
        })
        .onConflict(["store_guid", "store_region", "status", "topic"])
        .ignore();
    });

    return Promise.all(promises);
  }

  async addPriceUpdateTask(storeGuid: string, storeRegion: string) {
    return this.addToQueue({
      storeGuids: [storeGuid],
      storeRegion,
      topic: PsGameQueueTopic.PRICE_UPDATE,
    });
  }

  async addGamesToQueue(storeGuids: string[], storeRegion: string = "en-us") {
    const promises = storeGuids.map((gameGuid) => {
      return db(this.tableName)
        .insert({
          store_guid: gameGuid,
          store_region: storeRegion,
          status: PsGameQueueStatus.PENDING,
          topic: PsGameQueueTopic.ADD_GAME,
          created_at: helpers.dateToMySqlFormat(moment()),
          updated_at: helpers.dateToMySqlFormat(moment()),
        })
        .onConflict(["store_guid", "store_region", "topic"])
        .ignore();
    });

    return Promise.all(promises);
  }
};
