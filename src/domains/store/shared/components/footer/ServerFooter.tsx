import { getFooterData } from "./FooterData";
import { ClientFooter } from "./ClientFooter";

export async function ServerFooter() {
    // Fetch all footer data
    const footerData = await getFooterData();

    // Pass data to the client component
    return <ClientFooter {...footerData} />;
} 