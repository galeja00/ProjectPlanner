
export async function GET(req : Request, { params } : { params : { id : string }}) {
    try {
        return Response.json({status: 200});
    }
    catch (error) {

    }
}