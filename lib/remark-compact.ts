import { visit } from "unist-util-visit";
import type { Transformer } from "unified";
import type { Code, Root, RootContent } from "mdast";

const FileNameRegex = /filename="(.+)"/;

/**'
 * A remark plugin to convert Next.js docs Markdown syntax to Fumadocs format
 */
export function remarkCompact(): Transformer<Root, Root> {
  function toTab(nodes: Code[]) {
    const names = nodes.map((node) => {
      const match = FileNameRegex.exec(node.meta ?? "");
      return match?.[1] ?? "Tab";
    });

    const itemsArr = {
      type: "ExpressionStatement",
      expression: {
        type: "ArrayExpression",
        elements: names.map((name) => ({
          type: "Literal",
          value: name,
        })),
      },
    };

    return {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "items",
          value: {
            type: "mdxJsxAttributeValueExpression",
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                comments: [],
                body: [itemsArr],
              },
            },
          },
        },
      ],
      children: nodes.map((node, i) => {
        return {
          type: "mdxJsxFlowElement",
          name: "Tab",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "value",
              value: names[i],
            },
          ],
          children: [node],
        };
      }),
    };
  }

  return (tree) => {
    visit(tree, (node) => {
      if (!("children" in node)) return;
      let start = -1;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];

        if (
          child.type === "code" &&
          child.meta &&
          child.meta.includes("switcher")
        ) {
          if (start === -1) start = i;
        } else if (start !== -1) {
          const targets = node.children.slice(start, i);

          node.children.splice(
            start,
            i - start,
            toTab(targets as Code[]) as RootContent,
          );
          start = -1;
        }
      }
    });
  };
}
