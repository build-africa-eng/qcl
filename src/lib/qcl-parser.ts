// --- QCL PARSER (TypeScript) ---

// Defines the structure for all nodes in our Abstract Syntax Tree (AST).
export type QCLNode = {
  type: string;
  title?: string;
  name?: string;
  value?: any; // Can be string, number, array, or object
  props?: Record<string, string>;
  content?: string;
  body?: QCLNode[];
};

/**
 * Parses a single line of QCL into a node object.
 * @param line The line of code to parse.
 * @returns A QCLNode object for the AST.
 */
function parseNode(line: string): QCLNode {
    const [tag] = line.split(/\s+/);
    const props: Record<string, string> = {};
    let content = '';

    const propPartMatch = line.match(/:(.*)/s);
    let propPart = line.replace(tag, '').trim();
    if (propPartMatch) {
        content = propPartMatch[1] ? propPartMatch[1].trim() : '';
        propPart = line.substring(0, propPartMatch.index).replace(tag, '').trim();
    }

    const kvPairs = propPart.split(',').map(p => p.trim()).filter(Boolean);
    for (const pair of kvPairs) {
        const [k, v] = pair.split(':').map(p => p.trim());
        if (k && v) props[k] = v;
    }

    return {
        type: tag.charAt(0).toUpperCase() + tag.slice(1),
        props,
        content,
        body: [],
    };
}

/**
 * Parses a QCL source string into an Abstract Syntax Tree (AST).
 * @param source The full QCL source code.
 * @returns The root node of the AST.
 */
export function parseQCL(source: string): QCLNode {
    const lines = source.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('#'));

    const root: QCLNode = { type: 'Page', title: '', body: [] };
    const stack: { indent: number; node: QCLNode }[] = [{ indent: -1, node: root }];

    for (const rawLine of lines) {
        const indent = rawLine.search(/\S/);
        const line = rawLine.trim();

        if (line.startsWith('page ')) {
            const titleMatch = line.match(/title:\s*(.+)/);
            if (titleMatch) root.title = titleMatch[1].trim();
            continue;
        }

        if (line.startsWith('state ')) {
            const match = line.match(/^state (\w+):\s*(.*)$/s);
            if (match) {
                const [, name, value] = match;
                let parsedValue: any;
                try {
                    // Try to parse value as JSON (for arrays/objects)
                    parsedValue = JSON.parse(value);
                } catch (e) {
                    // Fallback for simple strings or numbers
                    parsedValue = /^\d+(\.\d+)?$/.test(value) ? Number(value) : value.replace(/^"(.*)"$/, '$1');
                }
                const current = stack[stack.length - 1].node;
                if (!current.body) current.body = [];
                current.body.push({ type: 'State', name, value: parsedValue });
            }
            continue;
        }

        const node = parseNode(line);

        while (stack.length && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].node;
        if (!parent.body) parent.body = [];
        parent.body.push(node);
        stack.push({ indent, node });
    }
    return root;
}
