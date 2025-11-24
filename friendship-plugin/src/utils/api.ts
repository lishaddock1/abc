export class SiYuanAPI {
    private plugin: any;

    constructor(plugin: any) {
        this.plugin = plugin;
    }

    async createDoc(params: { notebook: string; path: string; markdown: string }): Promise<string> {
        // 使用思源API创建文档
        const response = await fetch('/api/filetree/createDoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });
        const result = await response.json();
        return result.data;
    }

    async setBlockAttrs(blockId: string, attrs: Record<string, string>) {
        await fetch('/api/attr/setBlockAttrs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: blockId,
                attrs,
            }),
        });
    }

    async querySql(sql: string): Promise<any> {
        const response = await fetch('/api/query/sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stmt: sql }),
        });
        const result = await response.json();
        return result.data;
    }
}