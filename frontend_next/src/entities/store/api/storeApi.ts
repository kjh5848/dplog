export async function fetchStoreKeywordsStatus(storeId: number) {
    const res = await fetch(`http://localhost:8000/v1/stores/${storeId}/keywords/status`);
    if (!res.ok) {
        throw new Error('Failed to fetch keyword status');
    }
    return res.json();
}

export async function startKeywordDiscovery(storeId: number, seedKeyword: string) {
    const res = await fetch(`http://localhost:8000/v1/stores/${storeId}/keywords/discover`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seed_keyword: seedKeyword }),
    });
    if (!res.ok) {
        throw new Error('Failed to start keyword discovery');
    }
    return res.json();
}
