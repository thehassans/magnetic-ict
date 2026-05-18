const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        results.push(file);
      }
    }
  });
  return results;
}

const pageFiles = walk(path.join(__dirname, "../src/app/chatbot"));
let updatedCount = 0;

for (const file of pageFiles) {
  let content = fs.readFileSync(file, "utf8");
  
  if (!content.includes("await auth()")) continue;
  if (!content.includes("session.user.id")) continue;

  // Make sure getWorkspaceContext is imported
  if (content.includes("getSocialBotSubscriptionInfo") && !content.includes("getWorkspaceContext")) {
    content = content.replace(
      "getSocialBotSubscriptionInfo",
      "getSocialBotSubscriptionInfo, getWorkspaceContext"
    );
  } else if (!content.includes("getWorkspaceContext")) {
    // Inject import
    content = 'import { getWorkspaceContext } from "@/lib/social-bot-access";\n' + content;
  }

  // Replace `const uid = session.user.id;` or direct usage
  if (content.includes("const uid = session.user.id;")) {
    content = content.replace(
      "const uid = session.user.id;",
      "const workspace = await getWorkspaceContext(session.user.id);\n  const uid = workspace.ownerId;"
    );
  } else if (content.includes("const session = await auth();\n  if (!session?.user?.id) return null;")) {
    // If it doesn't have uid, we inject workspace
    content = content.replace(
      "const session = await auth();\n  if (!session?.user?.id) return null;",
      "const session = await auth();\n  if (!session?.user?.id) return null;\n  const workspace = await getWorkspaceContext(session.user.id);"
    );
    // Then safely replace session.user.id -> workspace.ownerId ONLY inside data fetching calls like getSocialBotIntegrations(session.user.id)
    content = content.replace(/getSocialBotIntegrations\(session\.user\.id\)/g, "getSocialBotIntegrations(workspace.ownerId)");
    content = content.replace(/getSocialBotAgents\(session\.user\.id\)/g, "getSocialBotAgents(workspace.ownerId)");
    content = content.replace(/getSocialBotDocuments\(session\.user\.id\)/g, "getSocialBotDocuments(workspace.ownerId)");
    content = content.replace(/getSocialBotThreads\(session\.user\.id\)/g, "getSocialBotThreads(workspace.ownerId)");
    content = content.replace(/getSocialBotQuickReplies\(session\.user\.id\)/g, "getSocialBotQuickReplies(workspace.ownerId)");
    content = content.replace(/getSocialBotProfile\(session\.user\.id\)/g, "getSocialBotProfile(workspace.ownerId)");
    content = content.replace(/getSocialBotWorkspace\(session\.user\.id\)/g, "getSocialBotWorkspace(workspace.ownerId)");
  }

  if (content !== fs.readFileSync(file, "utf8")) {
    fs.writeFileSync(file, content, "utf8");
    updatedCount++;
    console.log("Updated", file);
  }
}

console.log(`Updated ${updatedCount} page files.`);
