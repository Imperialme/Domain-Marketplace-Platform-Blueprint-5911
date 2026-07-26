import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { TOOLS } from './tools/index.js';

const server = new McpServer({
  name: 'gmail-mcp-multi-account',
  version: '1.0.0',
});

for (const tool of TOOLS) {
  server.registerTool(tool.name, tool.config, async (args) => {
    try {
      return await tool.handler(args);
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error: ${err.message}` }],
        isError: true,
      };
    }
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
