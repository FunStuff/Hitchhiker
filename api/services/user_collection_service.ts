import { RecordService } from './record_service';
import { CollectionService } from "./collection_service";
import { UserService } from "./user_service";
import { Collection } from "../models/collection";
import * as _ from "lodash";

export class UserCollectionService {

    static async getUserCollections(userId: string): Promise<Collection[]> {
        let collectionArr = await Promise.all([CollectionService.getOwns(userId), UserCollectionService.getUserTeamCollections(userId)]);

        let collections = <Collection[]>_.unionWith(collectionArr[0], collectionArr[1], (a, b) => (<Collection>a).id === (<Collection>b).id);

        const collectionIds = collections.map(o => o.id);
        const recordsList = await RecordService.getByCollectionIds(collectionIds, false);

        collections.forEach(o => o.records = recordsList[o.id]);

        return collections;
    }

    static async getUserTeamCollections(userId: string): Promise<Collection[]> {
        const user = await UserService.getUserById(userId);

        if (!user) {
            return null;
        }

        const teamIds = user.teams.map(t => t.id);

        return await CollectionService.getByTeamIds(teamIds);
    }
}