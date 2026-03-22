import { getBuildInfo } from "../../../src/utils/buildInfo";
export async function GET() {
    const info = getBuildInfo();
    return Response.json({ version: info.version, commit: info.commit });
}
