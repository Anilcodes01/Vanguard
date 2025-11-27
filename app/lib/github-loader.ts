interface GitTreeNode {
  path: string;
  type: string;
  url: string;
  sha?: string;
}

interface GitBlobContent {
  content: string;
}

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

const isCodeFile = (path: string): boolean => {
  const ignored = [
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", 
    ".git", ".next", "node_modules", "dist", "build", 
    ".ico", ".png", ".jpg", ".jpeg", ".svg", ".json"
  ];
  
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".prisma", ".html"];
  
  if (ignored.some(i => path.includes(i))) return false;
  return extensions.some(ext => path.endsWith(ext));
};

export async function fetchGithubRepo(repoUrl: string): Promise<string> {
  try {
    const parts = repoUrl.split("github.com/")[1]?.split("/");
    if (!parts || parts.length < 2) throw new Error("Invalid GitHub URL");
    
    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
    };
    if (GITHUB_TOKEN) headers["Authorization"] = `token ${GITHUB_TOKEN}`;

    let branch = "main";
    let treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    
    let treeRes = await fetch(treeUrl, { headers });
    if (!treeRes.ok && treeRes.status === 404) {
      branch = "master";
      treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      treeRes = await fetch(treeUrl, { headers });
    }

    if (!treeRes.ok) throw new Error("Could not fetch repository tree");

    const treeData: { tree: GitTreeNode[] } = await treeRes.json();
    
    const codeFiles: GitTreeNode[] = treeData.tree
      .filter((node: GitTreeNode) => node.type === "blob" && isCodeFile(node.path))
      .slice(0, 15);

    const filePromises: Promise<string>[] = codeFiles.map(async (node: GitTreeNode) => {
      const contentRes = await fetch(node.url, { headers });
      if (!contentRes.ok) {
        console.warn(`Failed to fetch content for ${node.path}: ${contentRes.status}`);
        return "";
      }
      const data: GitBlobContent = await contentRes.json();
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return `\n--- FILE: ${node.path} ---\n${content}`;
    });

    const filesContent = await Promise.all(filePromises);
    
    return filesContent.join("\n");

  } catch (error) {
    console.error("Error fetching GitHub repo:", error);
    return "";
  }
}