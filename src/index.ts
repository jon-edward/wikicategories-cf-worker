
import * as Realm from 'realm-web';

import { toError, toSuccess } from './utils';

// The Worker's environment bindings. See `wrangler.toml` file.
interface Env {
    // MongoDB Atlas Application ID
    ATLAS_APPID: string;

    // Secret key for the MongoDB Atlas API
    MONGODB_API_KEY: string;
}

// Define type alias; available via `realm-web`
type Document = globalThis.Realm.Services.MongoDB.Document;

// Declare the interface for a "todos" document
interface Category extends Document {
    name: string;
    predecessors: number[];
    successors: number[];
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectID;

// Define the Worker logic
const worker: ExportedHandler<Env> = {
    async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(req.url);
        App = App || new Realm.App(env.ATLAS_APPID);

        const method = req.method;
        const path = url.pathname.replace(/[/]$/, '');
        const catId = url.searchParams.get('id') || '';

        if (path !== '/api') {
            return toError({message: "Incorrect path, use '/api'"}, 404);
        }

        try {
            const credentials = Realm.Credentials.apiKey(env.MONGODB_API_KEY);
            // Attempt to authenticate
            var user = await App.logIn(credentials);
            var client = user.mongoClient('mongodb-atlas');
        } catch (err) {
            return toError({message: 'Error with authentication.'}, 500);
        }

        // Grab a reference to the "cloudflare.todos" collection
        const collection = client.db('wiki_categories').collection<Category>('edges');

        try {
            if (method === 'GET') {
                if (catId) {
                    // GET /api/todos?id=XXX
                    return toSuccess(
                        await collection.findOne({ _id: catId })
                    )
                }

                return toError({message: "No ID provided."}, 400);
            }

            return toError({ message: 'Not implemented.' }, 501);

        } catch (err) {
            const msg = (err as Error).message || 'Error with query.';
            return toError({message: msg}, 500);
        }
    }
}

// Export for discoverability
export default worker;