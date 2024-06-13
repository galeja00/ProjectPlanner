
export async function GET(req : Request) {
    try {
        return Response.json({ status: 200 });
    }
    catch (error) {
        return Response.json({ error: error }, { status: 500 })
    }
    
} 