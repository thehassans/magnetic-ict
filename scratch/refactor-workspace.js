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

const apiFiles = walk(path.join(__dirname, "../src/app/api/social-bot"));
let updatedApiCount = 0;

for (const file of apiFiles) {
  let content = fs.readFileSync(file, "utf8");
  
  if (!content.includes("session.user.id") || !content.includes("getRequiredUserSession")) continue;

  if (content.includes("getRequiredUserSession, userHasMagneticSocialBotAccess") && !content.includes("getWorkspaceContext")) {
    content = content.replace(
      "getRequiredUserSession, userHasMagneticSocialBotAccess", 
      "getRequiredUserSession, userHasMagneticSocialBotAccess, getWorkspaceContext"
    );
  } else if (content.match(/import \{[^}]*userHasMagneticSocialBotAccess[^}]*\} from "@\/lib\/social-bot-access"/)) {
    if (!content.includes("getWorkspaceContext")) {
      content = content.replace(
        "userHasMagneticSocialBotAccess",
        "userHasMagneticSocialBotAccess, getWorkspaceContext"
      );
    }
  }

  // Find occurrences of "if (!hasAccess)" block, whether single line or multi-line
  // We'll replace it and append the workspace context initialization right after it
  const regex1 = /if \(!hasAccess\) return NextResponse\.json\(\{ error: "[^"]+" \}, \{ status: 403 \}\);/g;
  const regex2 = /if \(!hasAccess\) \{\s+return NextResponse\.json\(\{ error: "[^"]+" \}, \{ status: 403 \}\);\s+\}/g;

  content = content.replace(regex1, (match) => {
    return match + "\n\n  const workspace = await getWorkspaceContext(session.user.id);";
  });
  
  content = content.replace(regex2, (match) => {
    return match + "\n\n  const workspace = await getWorkspaceContext(session.user.id);";
  });

  // Now replace session.user.id with workspace.ownerId
  // Since we only want to replace it after we've created the workspace variable
  let lines = content.split("\n");
  let inMethod = false;
  let workspaceAdded = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("export async function")) {
      inMethod = true;
      workspaceAdded = false;
    }
    
    if (inMethod && lines[i].includes("const workspace = await getWorkspaceContext")) {
      workspaceAdded = true;
    }
    
    // Check if line contains session.user.id and we've initialized workspace
    if (workspaceAdded && lines[i].includes("session.user.id") && !lines[i].includes("getWorkspaceContext(")) {
      lines[i] = lines[i].replace(/session\.user\.id/g, "workspace.ownerId");
    }
  }

  const newContent = lines.join("\n");
  if (newContent !== content) {
    fs.writeFileSync(file, newContent, "utf8");
    updatedApiCount++;
    console.log("Updated", file);
  }
}

console.log(`Updated ${updatedApiCount} API files.`);
