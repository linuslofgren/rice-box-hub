import express from "npm:express";
import * as trpc from "https://esm.sh/@trpc/server@9.27.2";
import * as trpcExpress from "https://esm.sh/@trpc/server@9.27.2/adapters/express";

const app = express()

app.listen(8000)
