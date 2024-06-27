

import { Head } from "../projects/[id]/components/other";
import Nodes from "./nodes";

export default function Page() {
    return (
        <main className="h-full w-full">
            <div className="flex w-2/4 flex-col m-auto py-14 space-y-8">
                <Head text={"Nodes"}/>
                <Nodes />
            </div>
        </main>
    )
}