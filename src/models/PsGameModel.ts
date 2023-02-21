import { db } from "../utils/db";
import { omitBy, isNull } from "lodash";
import { PsGame } from "../types";

module.exports = class PsGameModel {
  tableName = "ps_games";

  getPsGameByStoreGuid(storeGuid: string, storeRegion: string): Promise<any> {
    return db(this.tableName)
      .where("store_guid", storeGuid)
      .andWhere("store_region", storeRegion)
      .first();
  }

  async getMissingGames(
    storeGuids: string[],
    storeRegion: string
  ): Promise<string[]> {
    const existingGamesRes: { store_guid: string }[] | [] = await db(
      this.tableName
    )
      .select("store_guid")
      .whereIn("store_guid", storeGuids)
      .andWhere("store_region", storeRegion);
    const existingGames: string[] | [] = existingGamesRes?.map(
      (res) => res.store_guid
    );

    if (existingGames) {
      return storeGuids.filter(
        (storeGuid) => !existingGames.find((guid) => guid === storeGuid)
      );
    }

    return [];
  }

  async upsert(data: PsGameModel, psGameId: string): Promise<void> {
    const cData = this.cleanData(data);

    const insert = () => {
      return db(this.tableName)
        .where("ps_game_id", psGameId)
        .update(cData)
        .then((res: any) => {
          console.log("## updated id:", res.id, new Date().toISOString());
        });
    };

    if (psGameId) {
      return insert();
    }

    const gameRes = await db("ps_games")
      .where("store_region", cData.store_region)
      .andWhere("store_guid", cData.store_guid)
      .first();

    if (gameRes) {
      return insert();
    } else {
      await db("ps_games")
        .insert(cData)
        .then((res) => {
          console.log("## inserted id:", res, new Date().toISOString());
        });
    }
  }

  private cleanData(data: PsGameModel): PsGameModel {
    const cData = {
      ...data,
      game_in_other_regions_json: JSON.stringify(
        data?.game_in_other_regions_json
      ),
      raw_ps_deals_json: JSON.stringify(data?.raw_ps_deals_json),
      rating_ps: JSON.stringify(data?.rating_ps),
      rating_mc_user_score: JSON.stringify(data?.rating_mc_user_score),
      rating_mc_score: JSON.stringify(data?.rating_mc_score),
      content_rating_json: JSON.stringify(data?.content_rating_json),
      compatibility_by_platform_json: JSON.stringify(
        data?.compatibility_by_platform_json
      ),
      media_json: JSON.stringify(data?.media_json),
      created_at: this.getNowDate(),
      updated_at: this.getNowDate(),
      published_at: this.getNowDate(),
    };

    return omitBy(omitBy(cData, isNull), ["created_at", "created_by_id"]);
  }

  private getNowDate() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }
};
