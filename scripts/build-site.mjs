import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "site-src");
const outputDir = path.join(rootDir, "site");

function runValidation() {
  const result = spawnSync("node", [path.join(rootDir, "scripts", "validate-content.mjs")], {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(targetPath, content) {
  ensureDir(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function rawHtml(value) {
  return value ?? "";
}

function toTwitterEmbedUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "x.com" || parsed.hostname === "www.x.com") {
      parsed.hostname = "twitter.com";
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function pageTemplate({ title, description, stylesheetPath, body }) {
  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,700&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="${escapeHtml(stylesheetPath)}" />
  </head>
  <body>
    <div class="page-shell">
${body}
    </div>
    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
  </body>
</html>
`;
}

function renderHero({
  eyebrow,
  title,
  description,
  meta = [],
  actions = [],
}) {
  const metaHtml = meta.length
    ? `        <div class="hero-meta">
${meta
  .map(
    (item) => `          <div>
            <span class="meta-label">${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
          </div>`
  )
  .join("\n")}
        </div>`
    : "";

  const actionsHtml = actions.length
    ? `        <div class="hero-actions">
${actions
  .map(
    (item) =>
      `          <a class="button${item.secondary ? " button-secondary" : ""}" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
  )
  .join("\n")}
        </div>`
    : "";

  return `      <header class="hero">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="hero-copy">${escapeHtml(description)}</p>
${metaHtml}
${actionsHtml}
      </header>`;
}

function renderStory(item, variant = "") {
  const pillClass = item.label === "Official" ? "pill-official" : "pill-medium";
  const variantClass = variant ? ` ${variant}` : "";
  return `          <article class="story${variantClass}">
            <div class="story-meta">
              <span class="pill ${pillClass}">${escapeHtml(item.label)}</span>
              <time datetime="${escapeHtml(item.datetime)}">${escapeHtml(item.displayTime)}</time>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${rawHtml(item.summary)}</p>
            <a href="${escapeHtml(item.url)}">${escapeHtml(item.urlLabel)}</a>
          </article>`;
}

function renderTweetEmbed(item) {
  const embedUrl = toTwitterEmbedUrl(item.url);
  const pillClass = item.label === "Official" ? "pill-official" : "pill-medium";
  return `          <article class="tweet-card${item.primary ? " primary" : ""}">
            <div class="story-meta">
              <span class="pill ${pillClass}">${escapeHtml(item.label)}</span>
              <time datetime="${escapeHtml(item.datetime)}">${escapeHtml(item.displayTime)}</time>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${rawHtml(item.summary)}</p>
            <div class="tweet-embed">
              <blockquote class="twitter-tweet" data-dnt="true" data-theme="light" data-lang="ja">
                <a href="${escapeHtml(embedUrl)}">${escapeHtml(item.urlLabel)}</a>
              </blockquote>
            </div>
          </article>`;
}

function renderSection(titleKicker, title, body) {
  return `        <section class="card">
          <div class="section-head">
            <h2>${escapeHtml(title)}</h2>
            <p class="section-kicker">${escapeHtml(titleKicker)}</p>
          </div>
${body}
        </section>`;
}

function renderReleaseSections(sections = []) {
  if (!sections.length) {
    return "";
  }

  return `<div class="release-sections">
${sections
  .map(
    (section) => `                <section class="release-section">
                  <h4>${escapeHtml(section.title)}</h4>
                  <ul class="mini-list">
${section.items.map((detail) => `                    <li>${rawHtml(detail)}</li>`).join("\n")}
                  </ul>
                </section>`
  )
  .join("\n")}
              </div>`;
}

function renderReleaseDetails(details = []) {
  if (!details.length) {
    return "";
  }

  return `<ul class="mini-list">
${details.map((detail) => `                <li>${rawHtml(detail)}</li>`).join("\n")}
              </ul>`;
}

function renderReleaseEntries(releases = []) {
  if (!releases.length) {
    return "";
  }

  return `<div class="release-entries">
${releases
  .map(
    (release) => `                <article class="release-entry">
                  <div class="story-meta release-entry-meta">
                    <h4>${escapeHtml(release.version)}</h4>
                    <span>${escapeHtml(release.publishedAt)}</span>
                  </div>
                  <p>${rawHtml(release.summary)}</p>
                  ${renderReleaseDetails(release.details)}
                  ${renderReleaseSections(release.sections)}
                  ${release.url ? `<a href="${escapeHtml(release.url)}">${escapeHtml(release.urlLabel)}</a>` : ""}
                </article>`
  )
  .join("\n")}
              </div>`;
}

function renderReportPage(report, siteMeta) {
  const officialHtml = [
    `          <div class="tweet-list">
${report.officialNews.map((item) => renderTweetEmbed(item)).join("\n")}
          </div>`,
    `          <div class="zero-state">
${report.officialZeroStates
  .map(
    (item) => `            <div>
              <span class="meta-label">${escapeHtml(item.label)}</span>
              <p>${rawHtml(item.body)}</p>
            </div>`
  )
  .join("\n")}
          </div>`,
  ].join("\n\n");

  const signalsHtml = `          <div class="tweet-list">
${report.signals.map((item) => renderTweetEmbed(item)).join("\n")}
          </div>`;

  const releaseHtml = `          <div class="split-panels">
${report.releasePanels
  .map(
    (item) => `            <div class="mini-panel">
              <span class="meta-label">${escapeHtml(item.title)}</span>
              <p><strong>${escapeHtml(item.headline)}</strong></p>
              <p>${rawHtml(item.body)}</p>
              ${renderReleaseDetails(item.details)}
              ${renderReleaseSections(item.sections)}
              ${renderReleaseEntries(item.releases)}
              ${item.url ? `<a href="${escapeHtml(item.url)}">${escapeHtml(item.urlLabel)}</a>` : ""}
            </div>`
  )
  .join("\n")}
          </div>`;

  const sourcesHtml = `          <ul class="source-list">
${report.sources
  .map((item) => `            <li><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></li>`)
  .join("\n")}
          </ul>`;

  const summaryHtml = `          <ul class="summary-list">
${report.summaryBullets.map((item) => `            <li>${rawHtml(item)}</li>`).join("\n")}
          </ul>`;

  return pageTemplate({
    title: `${siteMeta.siteTitle} - ${report.date}`,
    description: `${report.date} の Claude 関連ニュースをまとめた日次レポート`,
    stylesheetPath: "../../assets/styles.css",
    body: `${renderHero({
      eyebrow: siteMeta.siteTitle,
      title: report.date,
      description: "Claude関連の公式発表、実装シグナル、リリース状況を短く読める形でまとめたWebレポートです。",
      meta: [
        { label: "調査窓", value: report.windowLabel },
        { label: "Permalink", value: `/reports/${report.date}/` },
      ],
      actions: [
        { href: "../../", label: "トップへ戻る" },
        { href: "../", label: "アーカイブ", secondary: true },
      ],
    })}

      <main class="report-grid">
${renderSection("Top Lines", "要点", summaryHtml)}
${renderSection("Official", "公式X", officialHtml)}
${renderSection("Anthropic Devs", "Anthropicメンバーのポスト", signalsHtml)}
${renderSection("Releases", "新規ブログ / リリース", releaseHtml)}
${renderSection("Sources", "ソース", sourcesHtml).replace('<section class="card">', '<section class="card sources-card">')}
      </main>`,
  });
}

function renderArchiveItem(report, href) {
  return `            <article class="archive-item">
              <div>
                <time datetime="${escapeHtml(report.date)}">${escapeHtml(report.date)}</time>
                <h3>${escapeHtml(report.archiveTitle)}</h3>
                <p>${escapeHtml(report.archiveSummary)}</p>
              </div>
              <a href="${escapeHtml(href)}">開く</a>
            </article>`;
}

function renderHomePage(siteMeta, reports) {
  const latest = reports[0];
  return pageTemplate({
    title: siteMeta.siteTitle,
    description: "Claude関連ニュースを毎日まとめるニュースレター風レポートのトップページ",
    stylesheetPath: "./assets/styles.css",
    body: `${renderHero({
      eyebrow: siteMeta.siteTitle,
      title: siteMeta.siteHeadline,
      description: siteMeta.siteDescription,
      meta: [
        { label: "Latest Issue", value: latest.date },
        { label: "Format", value: "Daily permalink + archive" },
      ],
      actions: [
        { href: `./reports/${latest.date}/`, label: "最新号を読む" },
        { href: "./reports/", label: "アーカイブを見る", secondary: true },
      ],
    })}

      <main class="report-grid">
${renderSection(
  "Latest",
  `${latest.date} 号`,
  `          <article class="story primary">
            <div class="story-meta">
              <span class="pill pill-official">Latest Issue</span>
              <time datetime="${escapeHtml(latest.date)}">${escapeHtml(latest.date)}</time>
            </div>
            <h3>${escapeHtml(latest.archiveTitle)}</h3>
            <p>${escapeHtml(latest.latestSummary)}</p>
            <a href="./reports/${escapeHtml(latest.date)}/">この号を開く</a>
          </article>`
)}
${renderSection(
  "Archive",
  "アーカイブ",
  `          <div class="archive-list">
${reports.map((report) => renderArchiveItem(report, `./reports/${report.date}/`)).join("\n")}
          </div>`
)}
      </main>`,
  });
}

function renderArchivePage(siteMeta, reports) {
  return pageTemplate({
    title: `${siteMeta.siteTitle} Archive`,
    description: "Daily Claude News の日付別アーカイブ",
    stylesheetPath: "../assets/styles.css",
    body: `${renderHero({
      eyebrow: siteMeta.siteTitle,
      title: "Archive",
      description: "日付ごとの固定URLで保存した Daily Claude News のアーカイブです。",
      actions: [
        { href: "../", label: "トップへ戻る" },
        { href: `./${reports[0].date}/`, label: "最新号を開く", secondary: true },
      ],
    })}

      <main class="report-grid">
${renderSection(
  "Reports",
  "日付別一覧",
  `          <div class="archive-list">
${reports.map((report) => renderArchiveItem(report, `./${report.date}/`)).join("\n")}
          </div>`
)}
      </main>`,
  });
}

function copyDirectory(source, target) {
  ensureDir(target);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function build() {
  runValidation();

  const siteMeta = readJson(path.join(sourceDir, "content", "site.json"));
  const reportsDir = path.join(sourceDir, "content", "reports");
  const reports = fs
    .readdirSync(reportsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => readJson(path.join(reportsDir, name)))
    .sort((a, b) => b.date.localeCompare(a.date));

  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);
  copyDirectory(path.join(sourceDir, "assets"), path.join(outputDir, "assets"));

  writeFile(path.join(outputDir, "index.html"), renderHomePage(siteMeta, reports));
  writeFile(path.join(outputDir, "reports", "index.html"), renderArchivePage(siteMeta, reports));

  for (const report of reports) {
    writeFile(
      path.join(outputDir, "reports", report.date, "index.html"),
      renderReportPage(report, siteMeta)
    );
  }

  writeFile(
    path.join(outputDir, "README.md"),
    `# Daily News Site

This directory is generated by \`node scripts/build-site.mjs\`.
Do not edit files in \`site/\` directly.

## Source of truth

- \`site-src/assets/styles.css\`: shared site styles
- \`site-src/schema/*.schema.json\`: JSON schema definitions
- \`site-src/content/site.json\`: site-level metadata
- \`site-src/content/reports/*.json\`: daily report data
- \`scripts/validate-content.mjs\`: schema validation
- \`scripts/build-site.mjs\`: renderer

## Publish to GitHub Pages

1. Validate content with \`node scripts/validate-content.mjs\`
2. Build the site with \`node scripts/build-site.mjs\`
3. Push the contents of \`site/\` into the root of \`hiragram/daily-news\`
4. In GitHub, open \`Settings > Pages\`
5. Set:
   - Source: \`Deploy from a branch\`
   - Branch: \`main\`
   - Folder: \`/ (root)\`

The site will then be available at:

- \`https://hiragram.github.io/daily-news/\`

Daily permalinks will look like:

- \`https://hiragram.github.io/daily-news/reports/2026-04-22/\`
`
  );
}

build();
